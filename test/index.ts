import * as dotenv from "dotenv";
import { expect } from "chai";
import { utils } from "ethers";
import { ethers } from "hardhat";

dotenv.config();

describe("Planet", function () {
  it("Should deployed", async function () {
    const Planet = await ethers.getContractFactory("Planet");
    const planet = await Planet.deploy();
    let deployed;
    try {
      await planet.deployed();
      deployed = true
    } catch (error) {
      deployed = false
    }
    expect(deployed).to.equal(true, "Contract does not deployed correctly");
  });

  it("Should flip sale state", async function () {

    const Planet = await ethers.getContractFactory("Planet");

    const planet = await Planet.deploy();
    try {
      await planet.deployed();
      const flipSateStateTx = await planet.flipSaleState()
      await flipSateStateTx.wait();
    } catch (error) {
    }
    const saleState = await planet.isSaleActive()
    expect(saleState).to.equal(true, "Sale state not flipped");
  });

  it("Should not flip sale state", async function () {
    const [owner, addr1] = await ethers.getSigners();

    const Planet = await ethers.getContractFactory("Planet");

    const planet = await Planet.deploy();
    try {
      await planet.deployed();
      const flipSateStateTx = await planet.connect(addr1).flipSaleState()
      await flipSateStateTx.wait();
    } catch (error) {
    }
    const saleState = await planet.isSaleActive()
    expect(saleState).to.equal(false, "Sale state flipped by not user");
  });

  it("Should mint new token", async function () {

    const Planet = await ethers.getContractFactory("Planet");

    const planet = await Planet.deploy();
    let minted;
    try {
      await planet.deployed();

      await planet.flipSaleState()

      await planet.setBaseURI(process.env.BASE_URI)

      const noOfTokens = 1
      await planet.mint(noOfTokens, { value: utils.parseEther(`${0.002 * noOfTokens}`) })
      minted = true
    } catch (error) {
      minted = false
    }
    expect(minted).to.equal(true, "Token does not minted correctly");
  });

  it("Should not mint new token - sale is not active", async function () {

    const Planet = await ethers.getContractFactory("Planet");

    const planet = await Planet.deploy();
    let minted;
    try {
      await planet.deployed();

      await planet.setBaseURI(process.env.BASE_URI)

      const noOfTokens = 1
      await planet.mint(noOfTokens, { value: utils.parseEther(`${0.002 * noOfTokens}`) })
      minted = true
    } catch (error) {
      minted = false
    }
    expect(minted).to.equal(false, "Token minted while sale is inactive");
  });

  it("Should not mint new token - insuficient eth value", async function () {

    const Planet = await ethers.getContractFactory("Planet");

    const planet = await Planet.deploy();
    let minted;
    try {
      await planet.deployed();

      await planet.flipSaleState()

      await planet.setBaseURI(process.env.BASE_URI)

      const noOfTokens = 1
      await planet.mint(noOfTokens, { value: utils.parseEther(`${0.001 * noOfTokens}`) })
      minted = true
    } catch (error) {
      minted = false
    }
    expect(minted).to.equal(false, "Token minted for low eth value");
  });

  it("Should not mint new token - exceeds max public mint limit", async function () {

    const Planet = await ethers.getContractFactory("Planet");

    const planet = await Planet.deploy();
    let minted;
    try {
      await planet.deployed();

      await planet.flipSaleState()

      await planet.setBaseURI(process.env.BASE_URI)

      const noOfTokens = 100
      await planet.mint(noOfTokens, { value: utils.parseEther(`${0.002 * noOfTokens}`) })
      minted = true
    } catch (error) {
      minted = false
    }
    expect(minted).to.equal(false, "More tokens minted than allowed");
  });

  it("Should not mint new token - exceeds token supply", async function () {
    const [owner, addr1] = await ethers.getSigners();

    const Planet = await ethers.getContractFactory("Planet");

    const planet = await Planet.deploy();
    let minted;
    try {
      await planet.deployed();

      await planet.flipSaleState()

      await planet.setBaseURI(process.env.BASE_URI)
  
      const noOfTokens = 10
      for(let i = 0; i < 10000; i++){
        await planet.mint(noOfTokens, { value: utils.parseEther(`${0.002 * noOfTokens}`) })
      }

      console.log('Minted 100000 tokens')

      await planet.mint(noOfTokens, { value: utils.parseEther(`${0.002 * noOfTokens}`) })
     
      minted = true
    } catch (error) {
      minted = false
    }
    expect(minted).to.equal(false, "More tokens minted than supply");
  }).timeout(100000);
});
