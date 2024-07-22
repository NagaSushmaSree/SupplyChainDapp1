//SPDX-License-Identifier:MIT
pragma solidity ^0.8.17;
contract supplyChain {

    uint public participants_id = 0;
    //uint public owner_id = 0;
    uint public product_id = 0;

    struct Product {
        uint productId;
        string productName;
        address productOwner;
        uint productCost;
        uint mfgTimestamp;
    }

    mapping(uint => Product)  products;
    mapping(uint => uint[]) userProducts;   //partId --> productId;;

    struct participant {
        string participantName;
        address participantAddress;
        string participantType;
    }

    mapping(uint => participant)  participants;
    
    //to check participant or not
     mapping(address => bool)  isParticipant;
     mapping(uint => bool) public  idCheck;           // check whether ID is Unique or not.
     mapping(uint => bool) public isProduct;   // check whether product is unique or not..


    struct ownerShip {
        //uint productId;
        uint txTimestamp;
        uint ownerId;
        address ownerAddress;
    }

    mapping(uint => ownerShip) ownerships;

    mapping(uint => uint[]) public productTracker;     //tracking using productId.. get all previous owners



    modifier onlyManufacturer(uint pratId) {
        //hash not required
        require(keccak256(abi.encode(participants[pratId].participantType)) == keccak256(abi.encode("Manufacturer")), "Not the Manufacturer");
        _;
    }

    function IsParticipant() public view returns(bool){
        return isParticipant[msg.sender];
    }

    function addParticipant(uint partId,string memory _participantName,string memory _participantType) public  {
        // require(idCheck[partId] == false,"Id has already Registered");
        // require(isParticipant[msg.sender] == false, 'You are already an participant');
        
        participants[partId].participantName = _participantName;
        participants[partId].participantType = _participantType;
        participants[partId].participantAddress = msg.sender;
        
        participants_id++;
        idCheck[partId] = true;
        isParticipant[msg.sender] = true;
    }

    function getParticipant(uint _pId) public view returns(string memory,string memory,address){
        return (participants[_pId].participantName,
        participants[_pId].participantType,
        participants[_pId].participantAddress);
    }

    function addProduct(uint prodId,uint partId,string memory _productName,address _productOwner,uint _productCost) public onlyManufacturer(partId) {
        require(isProduct[prodId] == false,"ProductId already Registered");
        products[prodId].productId = prodId;
        products[prodId].productName = _productName;
        products[prodId].productOwner = _productOwner;
        products[prodId].productCost = _productCost;
        products[prodId].mfgTimestamp = uint(block.timestamp);

        isProduct[prodId] = true;
        product_id++;
        userProducts[partId].push(prodId);
        productTracker[prodId].push(partId);
    }

    function getProduct(uint _productId) public view returns(string memory,address,uint,uint) {
        return (products[_productId].productName,
        products[_productId].productOwner,
        products[_productId].productCost,
        products[_productId].mfgTimestamp);
    }
   

   function newOwner(uint _productId,uint user1Id,uint user2Id) public returns(bool) {
         require(isProduct[_productId] == true,"ProductId has not Registered");
        string memory st1 = participants[user1Id].participantType;
        string memory st2 = participants[user2Id].participantType;
             if(keccak256(abi.encode(st1)) == keccak256(abi.encode("Manufacturer"))
         && keccak256(abi.encode(st2)) == keccak256(abi.encode("Supplier"))) {
              
              // changing owneships on product
              ownerships[_productId].ownerAddress = participants[user2Id].participantAddress;
              ownerships[_productId].ownerId = user2Id;
              ownerships[_productId].txTimestamp = uint(block.timestamp);
              
              //updating product owner
              products[_productId].productOwner = participants[user2Id].participantAddress;
              
              //adding new user as owner for product
              productTracker[_productId].push(user2Id);
              uint256 length = userProducts[user1Id].length;
              for (uint256 i = 0; i < length - 1; i++) {
            userProducts[user1Id][i] = userProducts[user1Id][i + 1];
        }
             userProducts[user1Id].pop();
              //userProducts[user2Id].push(p);

              
              return  true;

         }
           

         else if(keccak256(abi.encode(st1)) == keccak256(abi.encode("Supplier"))
         && keccak256(abi.encode(st2)) == keccak256(abi.encode("Supplier"))) {
             ownerships[_productId].ownerAddress = participants[user2Id].participantAddress;
              ownerships[_productId].ownerId = user2Id;
              ownerships[_productId].txTimestamp = uint(block.timestamp);
              products[_productId].productOwner = participants[user2Id].participantAddress;
             // productTracker[_productId].push(user1Id);
              productTracker[_productId].push(user2Id);
              userProducts[user2Id].push(product_id);
               userProducts[user1Id].pop();

              return  true;
         }

         else if(keccak256(abi.encode(st1)) == keccak256(abi.encode("Supplier"))
         && keccak256(abi.encode(st2)) == keccak256(abi.encode("Retailer"))) {
             ownerships[_productId].ownerAddress = participants[user2Id].participantAddress;
              ownerships[_productId].ownerId = user2Id;
              ownerships[_productId].txTimestamp = uint(block.timestamp);
              products[_productId].productOwner = participants[user2Id].participantAddress;
             // productTracker[_productId].push(user1Id);
              productTracker[_productId].push(user2Id);
              userProducts[user2Id].push(product_id);
               userProducts[user1Id].pop();

              return  true;
         }

         else if(keccak256(abi.encode(st1)) == keccak256(abi.encode("Retailer"))
         && keccak256(abi.encode(st2)) == keccak256(abi.encode("Retailer"))) {
             ownerships[_productId].ownerAddress = participants[user2Id].participantAddress;
              ownerships[_productId].ownerId = user2Id;
              ownerships[_productId].txTimestamp = uint(block.timestamp);
              products[_productId].productOwner = participants[user2Id].participantAddress;
              //productTracker[_productId].push(user1Id);
              productTracker[_productId].push(user2Id);
              userProducts[user2Id].push(product_id);
               userProducts[user1Id].pop();

              return  true;
         }

         else if(keccak256(abi.encode(st1)) == keccak256(abi.encode("Retailer"))
         && keccak256(abi.encode(st2)) == keccak256(abi.encode("Consumer"))) {
            ownerships[_productId].ownerAddress = participants[user2Id].participantAddress;
              ownerships[_productId].ownerId = user2Id;
              ownerships[_productId].txTimestamp = uint(block.timestamp);
              products[_productId].productOwner = participants[user2Id].participantAddress;
              //productTracker[_productId].push(user1Id);
              productTracker[_productId].push(user2Id);
              userProducts[user2Id].push(product_id);
               userProducts[user1Id].pop();

              return  true;
         }
         return false;
   } 
    
    function getTracking(uint _productId) external view returns(uint[] memory) {
        return productTracker[_productId];
    }

    function getParticipantsProducts(uint partId) external view returns(uint[] memory){
        return userProducts[partId];
    }

    function getOwnership(uint _productId) public view returns(uint,uint,address) {
        return(
        ownerships[_productId].ownerId,
        ownerships[_productId].txTimestamp,
        ownerships[_productId].ownerAddress);
    }

}