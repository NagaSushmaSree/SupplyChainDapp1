//SPDX-License-Identifier:MIT
pragma solidity ^0.8.17;
contract supplyChain {

    uint32 public participants_id = 0;
    //uint32 public owner_id = 0;
    uint32 public product_id = 0;
    uint i = 0;

    struct Product {
        uint32 productId;
        string productName;
        address productOwner;
        uint32 productCost;
        uint32 mfgTimestamp;
    }

    mapping(uint32 => Product)  products;
    mapping(uint32 => uint32[]) userProducts;   //partId --> productId;;

    struct participant {
        string participantName;
        address participantAddress;
        string participantType;
    }

    mapping(uint32 => participant)  participants;
    
    //to check participant or not
     mapping(address => bool)  isParticipant;
     mapping(uint32 => bool)  idCheck;           // check whether ID is Unique or not.
     mapping(uint32 => bool) public isProduct;   // check whether product is unique or not..


    struct ownerShip {
        uint32 txTimestamp;
        uint32 ownerId;
        address ownerAddress;
    }

    mapping(uint32 => ownerShip) ownerships;

    mapping(uint32 => uint32[]) productTracker;     //tracking using productId.. get all previous owners
    mapping(uint32 => address) updateOwner;  // by productId



    modifier onlyManufacturer(uint32 pratId) {
        //hash not required
        require(keccak256(abi.encode(participants[pratId].participantType)) == keccak256(abi.encode("Manufacturer")), "Not the Manufacturer");
        _;
    }

    function IsParticipant() public view returns(bool){
        return isParticipant[msg.sender];
    }

    function addParticipant(uint32 partId,string memory _participantName,string memory _participantType) public  {
        require(idCheck[partId] == false,"Id has already Registered");
        require(isParticipant[msg.sender] == false, 'You are already an participant');
        
        participants[partId].participantName = _participantName;
        participants[partId].participantType = _participantType;
        participants[partId].participantAddress = msg.sender;
        
        participants_id++;
        idCheck[partId] = true;
        isParticipant[msg.sender] = true;
    }

    function getParticipant(uint32 _pId) public view returns(string memory,string memory,address){
        return (participants[_pId].participantName,
        participants[_pId].participantType,
        participants[_pId].participantAddress);
    }

    function addProduct(uint32 prodId,uint32 partId,string memory _productName,uint32 _productCost) public  {
        require(isProduct[prodId] == false,"ProductId already Registered");
        //require(participants[partId].participantAddress == _productOwner,"Not the participant Address");  // for taking the correct 
          // owner address
          require(msg.sender == participants[partId].participantAddress,"Not the Valid Address");
        products[prodId].productId = prodId;
        products[prodId].productName = _productName;
        products[prodId].productOwner = participants[partId].participantAddress;
        products[prodId].productCost = _productCost;
        products[prodId].mfgTimestamp = uint32(block.timestamp);  

        ownerships[prodId].ownerAddress =  products[prodId].productOwner;
        ownerships[prodId].txTimestamp =  products[prodId].mfgTimestamp;
        ownerships[prodId].ownerId =  partId;



        isProduct[prodId] = true;
        product_id++;
        userProducts[partId].push(prodId);
        productTracker[prodId].push(partId);
    }

    function getProduct(uint32 _productId) public view returns(string memory,address,uint32,uint32) {
        return (products[_productId].productName,
        products[_productId].productOwner,
        products[_productId].productCost,
        products[_productId].mfgTimestamp);
    }
   

   function newOwner(uint32 _productId,uint32 user1Id,uint32 user2Id) public returns(bool) {
         //require(ownerships[_productId].ownerAddress == products[_productId].productOwner,"The product has reached to Consumer" );
         require(msg.sender == participants[user1Id].participantAddress,"Not the Valid Address");
         require(isProduct[_productId] == true,"ProductId has not Registered");
        string memory st1 = participants[user1Id].participantType;
        string memory st2 = participants[user2Id].participantType;
             if(keccak256(abi.encode(st1)) == keccak256(abi.encode("Manufacturer"))
         && keccak256(abi.encode(st2)) == keccak256(abi.encode("Supplier"))) {
              
              require(updateOwner[_productId] != participants[user2Id].participantAddress,"OwnerShip has changed");
              ownerships[_productId].ownerAddress = participants[user2Id].participantAddress;
              ownerships[_productId].ownerId = user2Id;
              ownerships[_productId].txTimestamp = uint32(block.timestamp);  // now
              
              //updating product owner
              products[_productId].productOwner = participants[user2Id].participantAddress;
              
              //adding new user as owner for product
              productTracker[_productId].push(user2Id);
               uint256 length = userProducts[user1Id].length;
               uint32 transferredProductId;

           for (i = 0; i < length; i++) {
             if (userProducts[user1Id][i] == _productId) {
            transferredProductId = userProducts[user1Id][i];
            for (uint256 j = i; j < length - 1; j++) {
                userProducts[user1Id][j] = userProducts[user1Id][j + 1];
            }
            userProducts[user1Id].pop();
            break;
        }
    }
        updateOwner[_productId] = participants[user2Id].participantAddress;    //ownership changed to user2Id;
        userProducts[user2Id].push(transferredProductId);
   
        return  true;

         }
           

         else if(keccak256(abi.encode(st1)) == keccak256(abi.encode("Supplier"))
         && keccak256(abi.encode(st2)) == keccak256(abi.encode("Supplier"))) {
           require(updateOwner[_productId] != participants[user2Id].participantAddress,"OwnerShip has changed");
             ownerships[_productId].ownerAddress = participants[user2Id].participantAddress;
              ownerships[_productId].ownerId = user2Id;
              ownerships[_productId].txTimestamp = uint32(block.timestamp);
              products[_productId].productOwner = participants[user2Id].participantAddress;
             // productTracker[_productId].push(user1Id);
              productTracker[_productId].push(user2Id);
             uint256 length = userProducts[user1Id].length;
               uint32 transferredProductId;

           for (i = 0; i < length; i++) {
             if (userProducts[user1Id][i] == _productId) {
            transferredProductId = userProducts[user1Id][i];
            for (uint256 j = i; j < length - 1; j++) {
                userProducts[user1Id][j] = userProducts[user1Id][j + 1];
            }
            userProducts[user1Id].pop();
            break;
        }
    }
   updateOwner[_productId] = participants[user2Id].participantAddress;    //ownership changed to user2Id
    userProducts[user2Id].push(transferredProductId);

              return  true;
         }

         else if(keccak256(abi.encode(st1)) == keccak256(abi.encode("Supplier"))
         && keccak256(abi.encode(st2)) == keccak256(abi.encode("Retailer"))) {
            require(updateOwner[_productId] != participants[user2Id].participantAddress,"OwnerShip has changed");
             ownerships[_productId].ownerAddress = participants[user2Id].participantAddress;
              ownerships[_productId].ownerId = user2Id;
              ownerships[_productId].txTimestamp = uint32(block.timestamp);
              products[_productId].productOwner = participants[user2Id].participantAddress;
             // productTracker[_productId].push(user1Id);
              productTracker[_productId].push(user2Id);
             uint256 length = userProducts[user1Id].length;
               uint32 transferredProductId;

           for (i = 0; i < length; i++) {
             if (userProducts[user1Id][i] == _productId) {
            transferredProductId = userProducts[user1Id][i];
            for (uint256 j = i; j < length - 1; j++) {
                userProducts[user1Id][j] = userProducts[user1Id][j + 1];
            }
            userProducts[user1Id].pop();
            break;
        }
    }
          updateOwner[_productId] = participants[user2Id].participantAddress;    //ownership changed to user2Id
          userProducts[user2Id].push(transferredProductId);
              return  true;
         }

         else if(keccak256(abi.encode(st1)) == keccak256(abi.encode("Retailer"))
         && keccak256(abi.encode(st2)) == keccak256(abi.encode("Retailer"))) {
            require(updateOwner[_productId] != participants[user2Id].participantAddress,"OwnerShip has changed");
             ownerships[_productId].ownerAddress = participants[user2Id].participantAddress;
              ownerships[_productId].ownerId = user2Id;
              ownerships[_productId].txTimestamp = uint32(block.timestamp);
              products[_productId].productOwner = participants[user2Id].participantAddress;
              //productTracker[_productId].push(user1Id);
              productTracker[_productId].push(user2Id);
             uint256 length = userProducts[user1Id].length;
               uint32 transferredProductId;

           for (i = 0; i < length; i++) {
             if (userProducts[user1Id][i] == _productId) {
            transferredProductId = userProducts[user1Id][i];
            for (uint256 j = i; j < length - 1; j++) {
                userProducts[user1Id][j] = userProducts[user1Id][j + 1];
            }
            userProducts[user1Id].pop();
            break;
        }
    }
             updateOwner[_productId] = participants[user2Id].participantAddress;    //ownership changed to user2Id
             userProducts[user2Id].push(transferredProductId);

              return  true;
         }

         else if(keccak256(abi.encode(st1)) == keccak256(abi.encode("Retailer"))
         && keccak256(abi.encode(st2)) == keccak256(abi.encode("Consumer"))) {
           require(updateOwner[_productId] != participants[user2Id].participantAddress,"OwnerShip has changed");
            ownerships[_productId].ownerAddress = participants[user2Id].participantAddress;
              ownerships[_productId].ownerId = user2Id;
              ownerships[_productId].txTimestamp = uint32(block.timestamp);
              products[_productId].productOwner = participants[user2Id].participantAddress;
              //productTracker[_productId].push(user1Id);
              productTracker[_productId].push(user2Id);
              uint256 length = userProducts[user1Id].length;
               uint32 transferredProductId;

           for (i = 0; i < length; i++) {
             if (userProducts[user1Id][i] == _productId) {
            transferredProductId = userProducts[user1Id][i];
            for (uint256 j = i; j < length - 1; j++) {
                userProducts[user1Id][j] = userProducts[user1Id][j + 1];
            }
            userProducts[user1Id].pop();
            break;
        }
    }
             updateOwner[_productId] = participants[user2Id].participantAddress;    //ownership changed to user2Id
              userProducts[user2Id].push(transferredProductId);

              return  true;
         }
         return false;
   } 
    
    function getTracking(uint32 _productId) external view returns(uint32[] memory) {
        return productTracker[_productId];
    }

    function getParticipantsProducts(uint32 partId) external view returns(uint32[] memory){
        return userProducts[partId];
    }

    function getOwnership(uint32 _productId) public view returns(uint32,uint32,address) {
        return(
        ownerships[_productId].ownerId,
        ownerships[_productId].txTimestamp,
        ownerships[_productId].ownerAddress);
    }

}