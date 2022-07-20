// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
contract ProxyAccount is Ownable, IERC721Receiver{

    IERC721 nft;
    constructor(address nftToken){
        nft = IERC721(nftToken);
    }

    function claim(uint256[] memory tokens) external onlyOwner{
        _claim(msg.sender, tokens);
    }

    function claim(address masterAddress, uint256[] memory tokens) external onlyOwner{
        _claim(masterAddress, tokens);
    }

    function _claim(address masterAddress, uint256[] memory tokens) internal virtual{
        for(uint i = 0; i < tokens.length; i++){
            nft.transferFrom(address(this), masterAddress, tokens[i]);
        }
    }

    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}

interface IProxyAccount {
    function claim(address masterAddress,uint256[] memory tokens) external;

    function transferOwnership(address newOwner) external;
}

contract ProxyAccountFactory {

    address private nftToken;

    constructor(address _nftToken){
        nftToken = _nftToken;
    }

    function createDeploySalted(uint256[] memory tokens,bytes32 salt) external{
        ProxyAccount pa = new ProxyAccount{salt: salt}(nftToken);
        IProxyAccount ipa = IProxyAccount(address(pa));
        ipa.claim(msg.sender, tokens);
        ipa.transferOwnership(msg.sender);
    }

    // get the ByteCode of the contract DeployWithCreate2
    function getBytecode() public view returns (bytes memory) {
        bytes memory bytecode = type(ProxyAccount).creationCode;
        return abi.encodePacked(bytecode, abi.encode(nftToken));
    }
}