import React, { useState, useEffect } from "react";
import Web3 from "web3";
import ABI from "../contracts/supplyChain.json";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [isParticipant, setIsParticipant] = useState("");
  const [participantProducts, setParticipantProducts] = useState([]);
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const connectToWallet = async () => {
    try {
      setLoading(true);
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
          "0x5fe3711299200193EbfEe17D516C094F829E42Fc" // replace with your contract address
        );
        setContract(contract);
        console.log(contract);
        const part = await contract.methods.IsParticipant().call();
        console.log(part);
        setIsParticipant(part);
      } else {
        setWallet("Please install Metamask");
      }
    } catch (error) {
      console.error(error);
      setWallet("Error: user rejected to connect the Metamask");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    connectToWallet();
  }, []);

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const gas = await contract.methods
        .addParticipant(participantId, participantName, participantType)
        .estimateGas({ from: account });
      await contract.methods
        .addParticipant(participantId, participantName, participantType)
        .send({ from: account, gas });
      setMessage("Participant Added Successfully");
      toast.success('Participant Added Successfully');
    } catch (error) {
      console.error(error.data.data.reason);
      setMessage("Error adding participant");
      toast.error('Error adding participant ' + error.data.data.reason);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const gas = await contract.methods
        .addProduct(
          Number(productId),
          Number(participantId),
          productName,
          productCost
        )
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
      toast.success('Product Added Successfully');
    } catch (error) {
      console.error(error);
      setMessage("Error adding product");
      toast.error('Error adding product'  + error.data.data.reason);
    } finally {
      setLoading(false);
    }
  };

  const handleNewOwner = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const gas = await contract.methods
        .newOwner(Number(productId), Number(participantId), Number(newOwnerId))
        .estimateGas({ from: account });
      await contract.methods
        .newOwner(Number(productId), Number(participantId), Number(newOwnerId))
        .send({ from: account, gas });
      setMessage("Ownership Transferred Successfully");
      toast.success('Ownership Transferred Successfully');
    } catch (error) {
      console.error(error);
      setMessage("Error transferring ownership");
      toast.error('Error transferring ownership ' + error.data.data.reason);
    } finally {
      setLoading(false);
    }
  };

  const handleGetTracking = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await contract.methods
        .getTracking(trackingProductId)
        .call();
      setMessage(`Product Tracking: ${result.join(", ")}`);
    } catch (error) {
      console.error(error);
      setMessage("Error getting tracking information");
      toast.error('Error getting tracking information');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchParticipantProducts = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      var result = await contract.methods
        .getParticipantsProducts(participantId)
        .call();
      setParticipantProducts(result);
      console.log(result);
      result =  await contract.methods.getParticipant(participantId).call();
      console.log(result);
    } catch (error) {
      console.error(error);
      setMessage("Error fetching participant products");
      toast.error('Error fetching participant products');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetails = async (id) => {
    try {
      setLoading(true);
      const result = await contract.methods.getProduct(id).call();
      setFetchedProduct(result);
    } catch (error) {
      console.error(error);
      setMessage("Error fetching product details");
      toast.error('Error fetching product details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toUTCString();
  };

  return (
    <div className="flex flex-col items-center bg-gray-900 pt-8">
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
      <div className="flex justify-evenly w-full">
        {/* Display Message */}
        {message && <p className="text-white mt-4">{message}</p>}
        {participantProducts.length > 0 ? (
          <ul className="list-disc list-inside text-white mt-4">
            <li className="list-none">Products List </li>
            {participantProducts.map((productId, index) => (
              <li className="" key={index}>{Number(productId)}</li>
            ))}
          </ul>
        ) : (
          <p className="text-white mt-4">No products found for this participant</p>
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
      <ToastContainer />
    </div>
  );
};

export default App;
