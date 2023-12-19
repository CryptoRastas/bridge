// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract WERC721 is ERC721 {
    mapping(uint256 tokenId => string) private s_tokenURIs;

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    function mint(address to, uint256 tokenId, string memory uri) public {
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function tokenURI(uint256 tokenId_) public view override returns (string memory) {
        return s_tokenURIs[tokenId_];
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        s_tokenURIs[tokenId] = _tokenURI;
    }
}
