// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import './MultisigOwnable.sol';
import './erc721A/ERC721A.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';



error MintCountAndMetaDataLengthDissimilarity();
error NoTokenExists();
error CallerIsNotOwner();
error SignatureIsNotOfficial();

contract GameItems is ERC721A, MultisigOwnable {
  
  string private _baseTokenURI;
  address private _signer;
  uint256 private currentIndex = 0;
  mapping(uint256 => string) internal ipfsMetadata;

  constructor() ERC721A('Ball', 'BALL'){}

  // Used to claim unclaimed tokens after airdrop/claim phase
  function devClaim(address to, uint256 quantity,string[] memory ipfsHash) external {
    if(quantity == ipfsHash.length){
      _mintWrapper(to, quantity);
      currentIndex += quantity;
      for (uint256 i = 0; i < quantity; i++) {
        ipfsMetadata[currentIndex-(quantity-i)] = ipfsHash[i];
      }
    }else{
      revert MintCountAndMetaDataLengthDissimilarity();
    }
  }

  function _mintWrapper(address to, uint256 numAzukiTokens) internal {
    _mint(to, numAzukiTokens, '', true);
  }
  
  function updateMetadata(uint256 tokenId, string memory ipfsHash, bytes memory signature)external {
    if(_exists(tokenId)){
      address owner = ownerOf(tokenId);
      bool isApprovedOrOwner = owner == msg.sender;
      if(isApprovedOrOwner){
        bytes32 msgHash = _getMsgHash(ipfsHash,tokenId);
        if(_validSignature(signature, msgHash) == _signer){
           ipfsMetadata[tokenId] = ipfsHash;
        }else{
          revert SignatureIsNotOfficial();
        }
      }else{
        revert CallerIsNotOwner();
      }
    }else{
      revert NoTokenExists();
    }
  }

  function _validSignature(bytes memory signature, bytes32 msgHash) internal pure returns (address) {
    return ECDSA.recover(msgHash, signature);
  }

  function _getMsgHash(string memory ipfsHash, uint256 tokenId) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encodePacked(ipfsHash,tokenId)))); 
  }


  function setKey(address signer) external onlyOwner {
    _signer = signer;
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return _baseTokenURI;
  }

  function setBaseURI(string calldata baseURI) external onlyOwner {
    _baseTokenURI = baseURI;
  }

  string private _nameOverride;
  string private _symbolOverride;

  function name() public view override returns (string memory) {
    if (bytes(_nameOverride).length == 0) {
      return ERC721A.name();
    }
    return _nameOverride;
  }

  function symbol() public view override returns (string memory) {
    if (bytes(_symbolOverride).length == 0) {
      return ERC721A.symbol();
    }
    return _symbolOverride;
  }

  function setNameAndSymbol(
    string calldata _newName,
    string calldata _newSymbol
  ) external onlyRealOwner {
    _nameOverride = _newName;
    _symbolOverride = _newSymbol;
  }

  function tokenURI(uint256 tokenId) override public view returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

        string memory baseURI = _baseURI();
        return bytes(baseURI).length != 0 ? string(abi.encodePacked(baseURI, ipfsMetadata[tokenId])) : '';
    }
}