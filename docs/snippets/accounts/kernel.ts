// [!region imports]
import { ENTRYPOINT_ADDRESS_V06, createSmartAccountClient } from "permissionless"
import { signerToEcdsaKernelSmartAccount } from "permissionless/accounts"
import {
	createPimlicoBundlerClient,
	createPimlicoPaymasterClient,
} from "permissionless/clients/pimlico"
import { createPublicClient, getContract, http, parseEther } from "viem"
import { sepolia } from "viem/chains"
// [!endregion imports]

// [!region clients]
export const publicClient = createPublicClient({
	transport: http("https://rpc.ankr.com/eth_sepolia"),
})

export const paymasterClient = createPimlicoPaymasterClient({
	transport: http("https://api.pimlico.io/v2/sepolia/rpc?apikey=API_KEY"),
	entryPoint: ENTRYPOINT_ADDRESS_V06,
})
// [!endregion clients]

// [!region signer]
import { privateKeyToAccount } from "viem/accounts"

const signer = privateKeyToAccount("0xPRIVATE_KEY")
// [!endregion signer]

// [!region smartAccount]
const kernelAccount = await signerToEcdsaKernelSmartAccount(publicClient, {
	entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // global entrypoint
	signer: signer,
	index: 0n, // optional
	address: "0x...", // optional, only if you are using an already created account
})
// [!endregion smartAccount]

// [!region smartAccountClient]
const smartAccountClient = createSmartAccountClient({
	account: kernelAccount,
	entryPoint: ENTRYPOINT_ADDRESS_V06,
	chain: sepolia,
	bundlerTransport: http("https://api.pimlico.io/v1/sepolia/rpc?apikey=API_KEY"),
	middleware: {
		sponsorUserOperation: paymasterClient.sponsorUserOperation, // optional
	},
})
// [!endregion smartAccountClient]

// [!region gasPrices]
export const bundlerClient = createPimlicoBundlerClient({
	transport: http("https://api.pimlico.io/v1/sepolia/rpc?apikey=API_KEY"),
	entryPoint: ENTRYPOINT_ADDRESS_V06,
})

const gasPrices = await bundlerClient.getUserOperationGasPrice()
// [!endregion gasPrices]

// [!region submit]
const txHash_$1 = await smartAccountClient.sendTransaction({
	to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
	value: parseEther("0.1"),
	maxFeePerGas: gasPrices.fast.maxFeePerGas, // if using Pimlico
	maxPriorityFeePerGas: gasPrices.fast.maxPriorityFeePerGas, // if using Pimlico
})
// [!endregion submit]

const nftAbi = [
	{
		inputs: [],
		name: "mint",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
] as const

// [!region submitNft]
const nftContract = getContract({
	address: "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
	abi: nftAbi,
	client: {
		public: publicClient,
		wallet: smartAccountClient,
	},
})

const txHash_$2 = await nftContract.write.mint()
// [!endregion submitNft]

// [!region submitBatch]
const txHash_$3 = await smartAccountClient.sendTransactions({
	transactions: [
		{
			to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
			value: parseEther("0.1"),
			data: "0x",
		},
		{
			to: "0x1440ec793aE50fA046B95bFeCa5aF475b6003f9e",
			value: parseEther("0.1"),
			data: "0x1234",
		},
	],
	maxFeePerGas: gasPrices.fast.maxFeePerGas, // if using Pimlico
	maxPriorityFeePerGas: gasPrices.fast.maxPriorityFeePerGas, // if using Pimlico
})
// [!endregion submitBatch]
