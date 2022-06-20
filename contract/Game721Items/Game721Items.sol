// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "./erc721A/ERC721A.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";


error URIQueryForNonexistentToken();

contract Game721Items  is Ownable, ERC721, ReentrancyGuard {

  mapping(uint256 => string) internal ipfsMetadata;
  uint256 private currentIndex = 0;

  constructor() ERC721("Azuki", "AZUKI") {}

  // For marketing etc.
  function devMint(uint256 tokenId, string memory ipfsHash) external {
    _safeMint(msg.sender, tokenId);
    ipfsMetadata[tokenId] = ipfsHash;
    // currentIndex += quantity;
    // for (uint256 i = 0; i < quantity; i++) {
    //   ipfsMetadata[currentIndex-(quantity-i)] = ipfsHash[i];
    //   centerNFT.addUserNFTpair(currentIndex-(quantity-i),"hello");
    // }
  }


  function updateMetadata(uint256 tokenId, string memory ipfsHash)external {
    require(_exists(tokenId),"ERC721Metadata: URI query for nonexistent token");
    address owner = ownerOf(tokenId);

    bool isApprovedOrOwner = owner == msg.sender;

    require(
        isApprovedOrOwner,
        "ERC721A: transfer caller is not owner nor approved"
        );
     ipfsMetadata[tokenId] = ipfsHash;
  }



  



  // metadata URI
  string private _baseTokenURI;

  function _baseURI() internal view virtual override returns (string memory) {
    return _baseTokenURI;
  }

  function setBaseURI(string calldata baseURI) external onlyOwner {
    _baseTokenURI = baseURI;
  }

  function withdrawMoney() external onlyOwner nonReentrant {
    (bool success, ) = msg.sender.call{value: address(this).balance}("");
    require(success, "Transfer failed.");
  }



    function tokenURI(uint256 tokenId) override public view returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

        string memory baseURI = _baseURI();
        return bytes(baseURI).length != 0 ? string(abi.encodePacked(baseURI, ipfsMetadata[tokenId])) : '';
    }
}