// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";


error ApprovalQueryForNonexistentToken();


interface Game721Items{
    function transferFrom(address from, address to, uint256 tokenId) external;
}

contract CenterNFT is IERC721Receiver{
    
    mapping(uint256 => string) public _userpair;

    Game721Items public game721Items;

    function setGame721Items(address game721ItemsAddress) public{
        game721Items = Game721Items(game721ItemsAddress);
    }
    
    function addUserNFTpair(uint256 tokenId, string memory userKey) external {
        _userpair[tokenId] = userKey;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4){
        
        return this.onERC721Received.selector;
    }

    

    function receiveNFT(uint256 tokenId, string memory userKey) external {
        if(keccak256(bytes(_userpair[tokenId])) == keccak256(bytes(userKey))){
            game721Items.transferFrom(address(this),msg.sender,tokenId);
        }  
    }


}