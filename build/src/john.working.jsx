import { useState, useEffect } from "react";
import Web3 from "web3";
import ABI from "../contracts/supplyChain.json";

const App = () => {
  const [wallet, setWallet] = useState("");
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [participantType, setParticipantType] = useState("");
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [productCost, setProductCost] = useState("");
  const [newOwnerId, setNewOwnerId] = useState("");
  const [trackingProductId, setTrackingProductId] = useState("");
  const [message, setMessage] = useState("");
  const [IsParticipant, setIsParticipant] = useState("");
  const [participantProducts, setParticipantProducts] = useState([]);
  const [fetchedProduct, setFetchedProduct] = useState(null);

  const fetchProductDetails = async (productId) => {
    try {
      const result = await contract.methods.getProduct(productId).call();
      setFetchedProduct(result);
      console.log(result);
      setMessage("Product details fetched successfully");
    } catch (error) {
      console.log(error);
      setMessage("Error fetching product details");
    }
  };

  const fetchParticipantProducts = async (e) => {
    e.preventDefault(); // Prevent form submission default behavior
    try {
      const result = await contract.methods
        .getParticipantsProducts(Number(participantId))
        .call();
      setParticipantProducts(result);
      console.log(result);
      setMessage("Participant products fetched successfully");
      // return result;
    } catch (error) {
      console.log(error);
      setMessage("Error fetching participant products");
      return [];
    }
  };

  const connectToWallet = async () => {
    try {
      if (window.ethereum) {
        setWallet("Metamask detected");
        await window.ethereum.request({
          method: "eth_requestAccounts",
          params: [],
        });
        setWallet("Metamask Connected successfully");
        const web3 = new Web3(window.ethereum);
        setWeb3(web3);
        const acc = await web3.eth.getAccounts();
        setAccount(acc[0]);
        const contract = new web3.eth.Contract(
          ABI.abi,
          // replace your  contract address
          "0x4779f33B17Dc82fb33a27F5Ca8EF792Bb6671329"
        );
        setContract(contract);
        const part = await contract.methods.IsParticipant().call();
        setIsParticipant(part);
        console.log(part);
        console.log(contract);
      } else {
        setWallet("Please install Metamask");
      }
    } catch (error) {
      console.log(error);
      setWallet("Error: user rejected to connect the Metamask");
    }
  };

  useEffect(() => {
    connectToWallet();
    fetchParticipantProducts();
  }, []);
  const handleFetchParticipantProducts = async (e) => {
    e.preventDefault(); // Prevent form submission default behavior
    try {
      await fetchParticipantProducts(e);
    } catch (error) {
      console.log(error);
      setMessage("Error fetching participant products");
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    try {
      const gas = await contract.methods
        .addParticipant(participantId, participantName, participantType)
        .estimateGas({ from: account });
      await contract.methods
        .addParticipant(participantId, participantName, participantType)
        .send({ from: account, gas });
      setMessage("Participant Added Successfully");
    } catch (error) {
      console.error(error);
      setMessage("Error adding participant");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const gas = await contract.methods
        .addProduct(productId, participantId, productName, productCost)
        .estimateGas({ from: account });
      await contract.methods
        .addProduct(
          Number(productId),
          Number(participantId),
          productName,
          productCost
        )
        .send({ from: account, gas });
      setMessage("Product Added Successfully");
    } catch (error) {
      console.log(error);
      setMessage("Error adding product");
    }
  };

  const handleNewOwner = async (e) => {
    e.preventDefault();
    try {
      const gas = await contract.methods
        .newOwner(productId, participantId, newOwnerId)
        .estimateGas({ from: account });
      await contract.methods
        .newOwner(productId, participantId, newOwnerId)
        .send({ from: account, gas });

      setMessage("Ownership Transferred Successfully");
    } catch (error) {
      console.log(error);
      setMessage("Error transferring ownership");
    }
  };

  const handleGetTracking = async (e) => {
    e.preventDefault();
    try {
      const result = await contract.methods
        .getTracking(trackingProductId)
        .call();
      console.log(result);
      setMessage(`Product Tracking: ${result.join(", ")}`);
    } catch (error) {
      console.log(error);
      setMessage("Error getting tracking information");
    }
  };

  // Function to format Unix timestamp to human-readable date
const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleString('en-US', options);
};


  return (
    <div className="flex flex-col items-center  bg-gray-900 pt-8">
      <h2 className="text-white mb-4 text-xl font-normal mt-0">
        Account : {account}
      </h2>
      <h1
        className={`text-white text-3xl font-bold ${
          wallet == "Metamask Connected successfully" ? "text-green-500" : ""
        }`}
      >
        Supply Chain DApp : <span className="font-light italic"> {wallet}</span>
      </h1>
      {wallet === "Error: user rejected to connect the Metamask" && (
        <button
          onClick={connectToWallet}
          className="bg-blue-700 hover:bg-blue-900 font-semibold p-2 px-4 rounded-full mt-3 text-white"
        >
          Retry to connect
        </button>
      )}

      <form onSubmit={handleAddParticipant} className="mt-8 z-0">
        <h2 className="text-white mb-4 text-xl z-auto">Add Participant</h2>
        <input
          type="number"
          value={participantId}
          onChange={(e) => setParticipantId(e.target.value)}
          className="bg-gray-200 p-2 rounded-md mb-2"
          placeholder="Participant ID"
          required
        />
        <input
          type="text"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
          className="bg-gray-200 p-2 rounded-md mb-2"
          placeholder="Participant Name"
          required
        />
        <input
          type="text"
          value={participantType}
          onChange={(e) => setParticipantType(e.target.value)}
          className="bg-gray-200 p-2 rounded-md mb-2"
          placeholder="Participant Type"
          required
        />
        <button
          type="submit"
          className="bg-blue-700 hover:bg-blue-900 font-semibold p-2 px-4 rounded-md text-white"
        >
          Add Participant
        </button>
      </form>

      {/* Add Product Form */}
      <form onSubmit={handleAddProduct} className="mt-8">
        <h2 className="text-white mb-4 text-xl">Add Product</h2>
        <input
          type="text"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="bg-gray-200 p-2 rounded-md mb-2"
          placeholder="Product ID"
          required
        />
        <input
          type="number"
          value={participantId}
          onChange={(e) => setParticipantId(e.target.value)}
          className="bg-gray-200 p-2 rounded-md mb-2"
          placeholder="Participant ID"
          required
        />
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="bg-gray-200 p-2 rounded-md mb-2"
          placeholder="Product Name"
          required
        />
        <input
          type="number"
          value={productCost}
          onChange={(e) => setProductCost(e.target.value)}
          className="bg-gray-200 p-2 rounded-md mb-2"
          placeholder="Product Cost"
          required
        />
        <button
          type="submit"
          className="bg-blue-700 hover:bg-blue-900 font-semibold p-2 px-4 rounded-md text-white"
        >
          Add Product
        </button>
      </form>

      {/* Transfer Ownership Form */}
         <form onSubmit={handleNewOwner} className="mt-8">
        <h2 className="text-white mb-4 text-xl">Transfer Ownership</h2>
        <input
          type="text"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="bg-gray-200 p-2 rounded-md mb-2"
          placeholder="Product ID"
          required
        />
        <input
          type="text"
          value={participantId}
          onChange={(e) => setParticipantId(e.target.value)}
          className="bg-gray-200 p-2 rounded-md mb-2"
          placeholder="User 1 ID"
          required
        />
        <input
          type="text"
          value={newOwnerId}
          onChange={(e) => setNewOwnerId(e.target.value)}
          className="bg-gray-200 p-2 rounded-md mb-2"
          placeholder="User 2 ID"
          required
        />
        <button
          type="submit"
          className="bg-blue-700 hover:bg-blue-900 font-semibold p-2 px-4 rounded-md text-white"
        >
          Transfer Ownership
        </button>
      </form>
      <div className="flex">
        {/* Get Tracking Form */}
        <form onSubmit={handleGetTracking} className="mt-8">
          <h2 className="text-white mb-4 text-xl">Get Product Tracking</h2>
          <input
            type="text"
            value={trackingProductId}
            onChange={(e) => setTrackingProductId(e.target.value)}
            className="bg-gray-200 p-2 rounded-md mb-2"
            placeholder="Product ID"
            required
          />
          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-900 font-semibold p-2 px-4 rounded-md text-white"
          >
            Get Tracking
          </button>
        </form>

        {/* Participant Products */}
        <form className="mt-8 ml-2">
          <h2 className="text-white mb-4 text-xl">Get Participant Products</h2>
          <input
            type="number"
            value={participantId}
            onChange={(e) => setParticipantId(e.target.value)}
            className="bg-gray-200 p-2 rounded-md mb-2"
            placeholder="Participant ID"
            required
          />
          <button
            onClick={handleFetchParticipantProducts}
            className="bg-blue-700 hover:bg-blue-900 font-semibold p-2 px-4 rounded-md text-white"
          >
            Fetch Products
          </button>
        </form>
        
      </div>
      <div className="flex">
        {/* Display Message */}
        {message && <p className="text-white mt-4">{message}</p>}
        {participantProducts.length > 0 ? (
          <ul className="list-disc list-inside text-white">
            {participantProducts.map((productId, index) => (
              <li key={index}>{Number(productId)}</li>
            ))}
          </ul>
        ) : (
          <p className="text-white">No products found for this participant</p>
        )}
      </div>
      {/* Fetch Product Details */}
      <div className="flex mt-4 h-[300px] justify-center items-center">
      <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchProductDetails(productId);
          }}
          className="mt-8"
        >
          <h2 className="text-white mb-4 text-xl">Fetch Product Details</h2>
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="bg-gray-200 p-2 rounded-md mb-2"
            placeholder="Product ID"
            required
          />
          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-900 font-semibold p-2 px-4 rounded-md text-white"
          >
            Fetch Product
          </button>
        </form>

        {/* Display Product Details */}
        {fetchedProduct && (
          <div className="mt-4 ml-4">
            <h3 className="text-white mb-2 text-lg">Fetched Product Details</h3>
            <p className="text-white">Name: {fetchedProduct["0"]}</p>
            <p className="text-white">Owner: {fetchedProduct["1"]}</p>
            <p className="text-white">Cost: {Number(fetchedProduct["2"])}</p>
            <p className="text-white">
              Manufacturing Timestamp: {formatDate(Number(fetchedProduct["3"]))}
            </p>
          </div>
        )}
        {!fetchedProduct && (
          <div className="mt-4 ml-4">
            <h3 className="text-white mb-2 text-lg">Fetched Product Details</h3>
            <p className="text-white">Name: </p>
            <p className="text-white">Owner: </p>
            <p className="text-white">Cost: </p>
            <p className="text-white">
              Manufacturing Timestamp: 
            </p>
          </div>
        )}
        </div>
    </div>
  );
};

export default App;
