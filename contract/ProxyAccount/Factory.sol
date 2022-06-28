// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
contract ProxyC {
    function claim(address nftToken,address masterAddress,uint256[] memory tokens) external{
        IERC721 erc721 = IERC721(nftToken); 
        for(uint i = 0; i < tokens.length; i++){
            erc721.transferFrom(address(this), masterAddress, tokens[i]);
        }
        // selfdestruct(payable(msg.sender));
    }
}

interface PINter {
    function claim(address nftToken, address masterAddress,uint256[] memory tokens) external;
}

contract Factory {
    function createDSalted(address nftToken, uint256[] memory tokens,bytes32 salt) external{
        // This complicated expression just tells you how the address
        // can be pre-computed. It is just there for illustration.
        // You actually only need ``new D{salt: salt}(arg)``.
        // bytes memory bytecode = type(ProxyC).creationCode;
        bytes memory bytecode = type(ProxyC).creationCode;
        address newAddr;
        assembly {
            let codeSize := mload(bytecode) // get size of init_bytecode
            newAddr := create2(
                0, // 0 wei
                add(bytecode, 32), // the bytecode itself starts at the second slot. The first slot contains array length
                codeSize, // size of init_code
                salt // salt from function arguments
            )
            if iszero(extcodesize(newAddr)) {
                revert(0, 0)
            }
        }
        PINter p = PINter(newAddr);
        p.claim(nftToken, msg.sender, tokens);
    }

    function calculation(bytes32 salt) public view returns(address){
        bytes memory bytecode = type(ProxyC).creationCode;
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(bytecode)
            ));
        return address(uint160(uint256(hash)));
    }
}