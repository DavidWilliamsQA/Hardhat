const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network, deployments, getNamedAccounts } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // if chainId is A use B
    // if chainId is X use Y

    // const ethUsdPriceFeedAddress = networkConfig[chainId["ethUsdPriceFeed"]]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    log(
        "=========================================================================="
    )
    log("Deploying FundMe and waiting for confirmations...")

    // when going for a localhost or hardhat network we want to use a mock

    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log(
        "=========================================================================================="
    )
}

module.exports.tags = ["all", "fundme"]
