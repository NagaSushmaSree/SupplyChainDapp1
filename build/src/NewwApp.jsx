import { useState, useEffect } from 'react';
import Web3 from 'web3';
import ABI from '../contracts/supplyChain.json';

const App = () => {
  const [wallet, setWallet] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [participantType, setParticipantType] = useState('');
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [productCost, setProductCost] = useState('');
  const [newOwnerId, setNewOwnerId] = useState('');
  const [trackingProductId, setTrackingProductId] = useState('');
  const [message, setMessage] = useState('');
  const [IsParticipant, setIsParticipant] = useState('');

  const connectToWallet = async () => {
    try {
      if (window.ethereum) {
        setWallet('Metamask detected');
        await window.ethereum.request({
          method: 'eth_requestAccounts',
          params: []
        });
        setWallet('Metamask Connected successfully');
        const web3 = new Web3(window.ethereum);
        setWeb3(web3);
        const acc = await web3.eth.getAccounts();
        setAccount(acc[0]);
        const contract = new web3.eth.Contract(
          ABI.abi,
          '0xcC2Bc5E9C35eCB4c0FC9B8F96B54DF1Fb9b96c31'
        );
        setContract(contract);
        const part = await contract.methods.IsParticipant().call();
        setIsParticipant(part)
        console.log(part)
        console.log(contract)

        
      } else {
        setWallet('Please install Metamask');
      }
    } catch (error) {
      console.log(error);
      setWallet('Error: user rejected to connect the Metamask');
    }
  };

  useEffect(() => {
    connectToWallet();
  }, []);

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    try {
      const gasLimit = 300000; // Example gas limit value, adjust as needed
  
      // Convert participantId to uint32
      const parsedParticipantId = parseInt(participantId);
  
      // Call the addParticipant function with the parsed participantId
      await contract.methods.addParticipant(parsedParticipantId, participantName, participantType).send({ from: account, gas: gasLimit });
      
      setMessage('Participant Added Successfully');
    } catch (error) {
      console.error(error);
      setMessage('Error adding participant');
    }
  };
  

  

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await contract.methods.addProduct(productId, participantId, productName, account, productCost).send({ from: account });
      setMessage('Product Added Successfully');
    } catch (error) {
      console.log(error);
      setMessage('Error adding product');
    }
  };

  const handleNewOwner = async (e) => {
    e.preventDefault();
    try {
      await contract.methods.newOwner(productId, account, newOwnerId).send({ from : account });

      setMessage('Ownership Transferred Successfully');
    } catch (error) {
      console.log(error);
      setMessage('Error transferring ownership');
    }
  };

  const handleGetTracking = async (e) => {
    e.preventDefault();
    try {
      const result = await contract.methods.getTracking(trackingProductId).call();
      setMessage(`Product Tracking: ${result.join(', ')}`);
    } catch (error) {
      console.log(error);
      setMessage('Error getting tracking information');
    }
  };

  return (
    <div className="w-screen flex flex-col justify-center items-center h-screen bg-gray-900">
      <h2 className="text-white mb-4 text-xl">{account}</h2>
      <h1 className={`text-white text-3xl font-bold ${wallet === 'Metamask Connected successfully' ? 'text-green-500' : ''}`}>
        {wallet}
      </h1>
      {wallet === 'Error: user rejected to connect the Metamask' && (
        <button onClick={connectToWallet} className="bg-blue-700 hover:bg-blue-900 font-semibold p-2 px-4 rounded-full mt-3 text-white">
          Retry to connect
        </button>
      )}

      <form onSubmit={handleAddParticipant} className="mt-8">
        <h2 className="text-white mb-4 text-xl">Add Participant</h2>
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
        <button type="submit" className="bg-blue-700 hover:bg-blue-900 font-semibold p-2 px-4 rounded-md text-white">
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
        <button type="submit" className="bg-blue-700 hover:bg-blue-900 font-semibold p-2 px-4 rounded-md text-white">
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
          value={newOwnerId}
          onChange={(e) => setNewOwnerId(e.target.value)}
          className="bg-gray-200 p-2 rounded-md mb-2"
          placeholder="New Owner ID"
          required
        />
        <button type="submit" className="bg-blue-700 hover:bg-blue-900 font-semibold p-2 px-4 rounded-md text-white">
          Transfer Ownership
        </button>
      </form>

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
        <button type="submit" className="bg-blue-700 hover:bg-blue-900 font-semibold p-2 px-4 rounded-md text-white">
          Get Tracking
        </button>
      </form>

      {/* Display Message */}
      {message && <p className="text-white mt-4">{message}</p>}
    </div>
  );
};

export default App;
