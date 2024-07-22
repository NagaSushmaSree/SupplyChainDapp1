import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SupplyChainContract from '../contracts/supplyChain.json';

const ParticipantComponent = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [participantType, setParticipantType] = useState('');
  const [isParticipant, setIsParticipant] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = SupplyChainContract.networks[networkId];
          console.log(deployedNetwork.address)
          const contractInstance = new web3Instance.eth.Contract(
            SupplyChainContract.abi,
            deployedNetwork && deployedNetwork.address,
          );
          setContract(contractInstance);
        } catch (error) {
          console.error('Error connecting to web3', error);
        }
      } else {
        console.error('Please install MetaMask');
      }
    };
    loadWeb3();
  }, []);

  const handleAddParticipant = async () => {
    try {
      await contract.methods.addParticipant(participantId, participantName, participantType).send({ from: account });
      setMessage('Participant added successfully');
    } catch (error) {
      console.error('Error adding participant:', error);
      setMessage('Error adding participant');
    }
  };

  const handleIsParticipant = async () => {
    try {
      const result = await contract.methods.IsParticipant().call({ from: account });
      setIsParticipant(result);
    } catch (error) {
      console.error('Error checking participant status:', error);
      setMessage('Error checking participant status');
    }
  };

  return (
    <div>
      <h2>Add Participant</h2>
      <div>
        <label htmlFor="participantId">Participant ID:</label>
        <input
          type="number"
          id="participantId"
          value={participantId}
          onChange={(e) => setParticipantId(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="participantName">Participant Name:</label>
        <input
          type="text"
          id="participantName"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="participantType">Participant Type:</label>
        <input
          type="text"
          id="participantType"
          value={participantType}
          onChange={(e) => setParticipantType(e.target.value)}
        />
      </div>
      <button onClick={handleAddParticipant}>Add Participant</button>

      <h2>Check Participant Status</h2>
      <button onClick={handleIsParticipant}>Check</button>
      {isParticipant !== '' && <p>{isParticipant ? 'You are a participant' : 'You are not a participant'}</p>}

      {message && <p>{message}</p>}
    </div>
  );
};

export default ParticipantComponent;
