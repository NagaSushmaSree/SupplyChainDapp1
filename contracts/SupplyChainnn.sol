//SPDX-License-Identifier:MIT
pragma solidity ^0.8.17;
contract supplyChainoldd {

    uint32 public participants_id = 0;
    uint32 public owner_id = 0;
    uint32 public product_id = 0;

    struct Product {
        uint32 productId;
        string productName;
        address productOwner;
        uint32 productCost;
        uint32 mfgTimestamp;
    }

    mapping(uint32 => Product)  products;
    mapping(uint32 => Product[]) userProducts;

    struct participant {
        string participantName;
        address participantAddress;
        string participantType;
    }

    mapping(uint32 => participant)  participants;
    
    //to check participant or not
    mapping(address => bool)  isParticipant;

    struct ownerShip {
        //uint32 productId;
        uint32 txTimestamp;
        uint32 ownerId;
        address ownerAddress;
    }

    mapping(uint32 => ownerShip) ownerships;

    mapping(uint32 => uint32[]) public productTracker;     //tracking using productId.. get all previous owners



    modifier onlyManufacturer(uint32 pratId) {
        //hash not required
        require(keccak256(abi.encode(participants[pratId].participantType)) == keccak256(abi.encode("Manufacturer")), "Not the Manufacturer");
        _;
    }

    function IsParticipant() public view returns(bool){
        return isParticipant[msg.sender];
    }

    function addParticipant(uint32 partId,string memory _participantName,string memory _participantType) public  {
        //uint32 pId = participants_id++;
        require(isParticipant[msg.sender] == true, 'You are already an participant');
        
        participants[partId].participantName = _participantName;
        participants[partId].participantType = _participantType;
        participants[partId].participantAddress = msg.sender;
        
        participants_id++;
        //set as true
        isParticipant[msg.sender] = true;
    }

    function getParticipant(uint32 _pId) public view returns(string memory,string memory,address){
        return (participants[_pId].participantName,
        participants[_pId].participantType,
        participants[_pId].participantAddress);
    }

    function addProduct(uint32 prodId,uint32 partId,string memory _productName,address _productOwner,uint32 _productCost) public onlyManufacturer(partId) {
        products[prodId].productId = prodId;
        products[prodId].productName = _productName;
        products[prodId].productOwner = _productOwner;
        products[prodId].productCost = _productCost;
        products[prodId].mfgTimestamp = uint32(block.timestamp);
        product_id++;
        productTracker[prodId].push(partId);
    }

    function getProduct(uint32 _productId) public view returns(string memory,address,uint32,uint32) {
        return (products[_productId].productName,
        products[_productId].productOwner,
        products[_productId].productCost,
        products[_productId].mfgTimestamp);
    }
   

   function newOwner(uint32 _productId,uint32 user1Id,uint32 user2Id) public returns(bool) {
        string memory st1 = participants[user1Id].participantType;
        string memory st2 = participants[user2Id].participantType;
             if(keccak256(abi.encode(st1)) == keccak256(abi.encode("Manufacturer"))
         && keccak256(abi.encode(st2)) == keccak256(abi.encode("Supplier"))) {
              
              // changing owneships on product
              ownerships[_productId].ownerAddress = participants[user2Id].participantAddress;
              ownerships[_productId].ownerId = user2Id;
              ownerships[_productId].txTimestamp = uint32(block.timestamp);
              
              //updating product owner
              products[_productId].productOwner = participants[user2Id].participantAddress;
              
              //adding new user as owner for product
              productTracker[_productId].push(user2Id);
              
              return  true;

         }
           

         else if(keccak256(abi.encode(st1)) == keccak256(abi.encode("Supplier"))
         && keccak256(abi.encode(st2)) == keccak256(abi.encode("Supplier"))) {
             ownerships[_productId].ownerAddress = participants[user2Id].participantAddress;
              ownerships[_productId].ownerId = user2Id;
              ownerships[_productId].txTimestamp = uint32(block.timestamp);
              products[_productId].productOwner = participants[user2Id].participantAddress;
             // productTracker[_productId].push(user1Id);
              productTracker[_productId].push(user2Id);

              return  true;
         }

         else if(keccak256(abi.encode(st1)) == keccak256(abi.encode("Supplier"))
         && keccak256(abi.encode(st2)) == keccak256(abi.encode("Retailer"))) {
             ownerships[_productId].ownerAddress = participants[user2Id].participantAddress;
              ownerships[_productId].ownerId = user2Id;
              ownerships[_productId].txTimestamp = uint32(block.timestamp);
              products[_productId].productOwner = participants[user2Id].participantAddress;
             // productTracker[_productId].push(user1Id);
              productTracker[_productId].push(user2Id);

              return  true;
         }

         else if(keccak256(abi.encode(st1)) == keccak256(abi.encode("Retailer"))
         && keccak256(abi.encode(st2)) == keccak256(abi.encode("Retailer"))) {
             ownerships[_productId].ownerAddress = participants[user2Id].participantAddress;
              ownerships[_productId].ownerId = user2Id;
              ownerships[_productId].txTimestamp = uint32(block.timestamp);
              products[_productId].productOwner = participants[user2Id].participantAddress;
              //productTracker[_productId].push(user1Id);
              productTracker[_productId].push(user2Id);

              return  true;
         }

         else if(keccak256(abi.encode(st1)) == keccak256(abi.encode("Retailer"))
         && keccak256(abi.encode(st2)) == keccak256(abi.encode("Consumer"))) {
            ownerships[_productId].ownerAddress = participants[user2Id].participantAddress;
              ownerships[_productId].ownerId = user2Id;
              ownerships[_productId].txTimestamp = uint32(block.timestamp);
              products[_productId].productOwner = participants[user2Id].participantAddress;
              //productTracker[_productId].push(user1Id);
              productTracker[_productId].push(user2Id);

              return  true;
         }
         return false;
   } 
    
    function getTracking(uint32 _productId) external view returns(uint32[] memory) {
        return productTracker[_productId];
    }

    function getOwnership(uint32 _productId) public view returns(uint32,uint32,address) {
        return(
        ownerships[_productId].ownerId,
        ownerships[_productId].txTimestamp,
        ownerships[_productId].ownerAddress);
    }

}

//get user products
//