import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from '@ethersproject/contracts';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import * as chai from "chai";
import chaiAsPromised from 'chai-as-promised'

import { keccak256 } from "@ethersproject/keccak256";
chai.use(chaiAsPromised);

function parseEther(amount: Number) {
    return ethers.parseUnits(amount.toString(), 18);
}

describe("Vault", function () {
    let owner: SignerWithAddress,
        alice: any,
        bob: any,
        carol: any;

    let vault: any;
    let token: Contract;

    beforeEach(async () => {
        await ethers.provider.send("hardhat_reset", []);
        [owner, alice, bob, carol] = await ethers.getSigners();

        const Vault = await ethers.getContractFactory("Vault", owner);
        vault = await Vault.deploy(owner.address);
        const Token = await ethers.getContractFactory("Token", owner);
        token = await Token.deploy();
        await vault.setToken(token.getAddress());
    })

    ////// Happy Path
    it("Should deposit into the Vault", async () => {
        await token.transfer(alice.getAddress(), parseEther(1 * 10 ** 6));
        await token.connect(alice).approve(vault.getAddress(), token.balanceOf(alice.getAddress()));
        await vault.connect(alice).deposit(parseEther(500 * 10 ** 3));
        expect(await token.balanceOf(vault.getAddress())).equal(parseEther(500 * 10 ** 3));
    });
    it("Should withdraw", async () => {
        //grant withdrawer role to Bob
        const WITHDRAWER_ROLE = keccak256(Buffer.from("WITHDRAWER_ROLE")).toString();
        await vault.grantRole(WITHDRAWER_ROLE, bob.getAddress());

        // setter vault functions

        await vault.setWithdrawEnable(true);
        await vault.setMaxWithdrawAmount(parseEther(1 * 10 ** 6));

        // alice deposit into the vault
        await token.transfer(alice.getAddress(), parseEther(1 * 10 ** 6));
        await token.connect(alice).approve(vault.getAddress(), token.balanceOf(alice.getAddress()));
        await vault.connect(alice).deposit(parseEther(500 * 10 ** 3));

        // bob withdraw into alice address
        await vault.connect(bob).withdraw(parseEther(300 * 10 ** 3), alice.getAddress());

        expect(await token.balanceOf(vault.getAddress())).equal(parseEther(200 * 10 ** 3));
        expect(await token.balanceOf(alice.getAddress())).equal(parseEther(800 * 10 ** 3));
    });
    ///////Unhappy Path/////////
    it("Should not deposit, Insufficient account balance", async () => {
        await token.transfer(alice.getAddress(), parseEther(1 * 10 ** 6));
        await token.connect(alice).approve(vault.getAddress(), token.balanceOf(alice.getAddress()));
        await expect(vault.connect(alice).deposit(parseEther(2 * 10 ** 6))).revertedWith('Insufficient account balance');
    });
    it("Should not withdraw, Withdraw is not available ", async () => {
        //grant withdrawer role to Bob
        const WITHDRAWER_ROLE = keccak256(Buffer.from("WITHDRAWER_ROLE")).toString();
        await vault.grantRole(WITHDRAWER_ROLE, bob.getAddress());

        // setter vault functions

        await vault.setWithdrawEnable(false);
        await vault.setMaxWithdrawAmount(parseEther(1 * 10 ** 6));

        // alice deposit into the vault
        await token.transfer(alice.getAddress(), parseEther(1 * 10 ** 6));
        await token.connect(alice).approve(vault.getAddress(), token.balanceOf(alice.getAddress()));
        await vault.connect(alice).deposit(parseEther(500 * 10 ** 3));

        // bob withdraw into alice address
        await expect(vault.connect(bob).withdraw(parseEther(300 * 10 ** 3), alice.getAddress())).revertedWith('Withdraw is not available');

    });
    it("Should not withdraw, Exceed maximum amount ", async () => {
        //grant withdrawer role to Bob
        const WITHDRAWER_ROLE = keccak256(Buffer.from("WITHDRAWER_ROLE")).toString();
        await vault.grantRole(WITHDRAWER_ROLE, bob.getAddress());

        // setter vault functions

        await vault.setWithdrawEnable(true);
        await vault.setMaxWithdrawAmount(parseEther(1 * 10 ** 3));

        // alice deposit into the vault
        await token.transfer(alice.getAddress(), parseEther(1 * 10 ** 6));
        await token.connect(alice).approve(vault.getAddress(), token.balanceOf(alice.getAddress()));
        await vault.connect(alice).deposit(parseEther(500 * 10 ** 3));

        // bob withdraw into alice address
        await expect(vault.connect(bob).withdraw(parseEther(2 * 10 ** 3), alice.getAddress())).revertedWith('Exceed maximum amount');

    });
    it("Should not withdraw, Caller is not a withdrawer", async () => {
        //grant withdrawer role to Bob
        const WITHDRAWER_ROLE = keccak256(Buffer.from("WITHDRAWER_ROLE")).toString();
        await vault.grantRole(WITHDRAWER_ROLE, bob.getAddress());

        // setter vault functions

        await vault.setWithdrawEnable(true);
        await vault.setMaxWithdrawAmount(parseEther(1 * 10 ** 3));

        // alice deposit into the vault
        await token.transfer(alice.getAddress(), parseEther(1 * 10 ** 6));
        await token.connect(alice).approve(vault.getAddress(), token.balanceOf(alice.getAddress()));
        await vault.connect(alice).deposit(parseEther(500 * 10 ** 3));

        // bob withdraw into alice address
        await expect(vault.connect(carol).withdraw(parseEther(1 * 10 ** 3), alice.getAddress())).revertedWith('Caller is not a withdrawer');

    })
    it("Should not withdraw, ERC20: transfer amount exceeds balance", async () => {
        //grant withdrawer role to Bob
        const WITHDRAWER_ROLE = keccak256(Buffer.from("WITHDRAWER_ROLE")).toString();
        await vault.grantRole(WITHDRAWER_ROLE, bob.getAddress());

        // setter vault functions

        await vault.setWithdrawEnable(true);
        await vault.setMaxWithdrawAmount(parseEther(5 * 10 ** 3));

        // alice deposit into the vault
        await token.transfer(alice.getAddress(), parseEther(1 * 10 ** 6));
        await token.connect(alice).approve(vault.getAddress(), token.balanceOf(alice.getAddress()));
        await vault.connect(alice).deposit(parseEther(2 * 10 ** 3));

        // bob withdraw into alice address
        await expect(vault.connect(bob).withdraw(parseEther(3 * 10 ** 3), alice.getAddress())).revertedWith('ERC20: transfer amount exceeds balance');

    })
});