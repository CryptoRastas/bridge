// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "./interfaces/IONFT721.sol";
import "./ONFT721Core.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract ONFT721 is ONFT721Core, ERC721, ERC721URIStorage, IONFT721 {
    constructor(
        string memory _name,
        string memory _symbol,
        uint _minGasToTransfer,
        address _lzEndpoint
    ) ERC721(_name, _symbol) ONFT721Core(_minGasToTransfer, _lzEndpoint) {}

    function _send(
        address _from,
        uint16 _dstChainId,
        bytes memory _toAddress,
        address _ERC721Address,
        uint[] memory _tokenIds,
        address payable _refundAddress,
        address _zroPaymentAddress,
        bytes memory _adapterParams
    ) internal virtual override {
        /// @dev check if token that is sending is same as THIS token, since it has deployed itself as bridged token
        require(_ERC721Address == address(this), "ONFT721: invalid ERC721 token");
        super._send(
            _from,
            _dstChainId,
            _toAddress,
            _ERC721Address,
            _tokenIds,
            _refundAddress,
            _zroPaymentAddress,
            _adapterParams
        );
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ONFT721Core, ERC721, ERC721URIStorage, IERC165) returns (bool) {
        return interfaceId == type(IONFT721).interfaceId || super.supportsInterface(interfaceId);
    }

    function _debitFrom(address _from, uint16, bytes memory, uint _tokenId) internal virtual override {
        require(_isApprovedOrOwner(_msgSender(), _tokenId), "ONFT721: send caller is not owner nor approved");
        require(ERC721.ownerOf(_tokenId) == _from, "ONFT721: send from incorrect owner");
        _transfer(_from, address(this), _tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage, IERC721Metadata) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _creditTo(uint16, address _toAddress, uint _tokenId, string memory _tokenURI) internal virtual override {
        require(!_exists(_tokenId) || (_exists(_tokenId) && ERC721.ownerOf(_tokenId) == address(this)));
        if (!_exists(_tokenId)) {
            _safeMint(_toAddress, _tokenId);
            _setTokenURI(_tokenId, _tokenURI);
        } else {
            _transfer(address(this), _toAddress, _tokenId);
        }
    }

    function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}
