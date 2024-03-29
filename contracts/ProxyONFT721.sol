// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "./ONFT721Core.sol";

contract ProxyONFT721 is ONFT721Core, IERC721Receiver {
    using ERC165Checker for address;

    /// @dev ERC721 token to be proxied
    IERC721 public immutable token;

    constructor(
        /// @dev required gas to transfer and store NFT locally
        uint _minGasToTransferAndStore,
        address _lzEndpoint,
        address _proxyToken
    ) ONFT721Core(_minGasToTransferAndStore, _lzEndpoint) {
        require(_proxyToken.supportsInterface(type(IERC721).interfaceId), "ProxyONFT721: invalid ERC721 token");
        token = IERC721(_proxyToken);
    }

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
        /// @dev check if token that is sending is same as proxied token
        require(_ERC721Address == address(token), "ProxyONFT721: invalid ERC721 token");
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

    /// @dev interface to handle ERC721 token transfer
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC721Receiver).interfaceId || super.supportsInterface(interfaceId);
    }

    /// @dev lock NFT on source chain
    function _debitFrom(address _from, uint16, bytes memory, uint _tokenId) internal virtual override {
        require(_from == _msgSender(), "ProxyONFT721: owner is not send caller");
        token.safeTransferFrom(_from, address(this), _tokenId);
    }

    /// @dev unlock NFT on source chain
    function _creditTo(
        uint16,
        address _toAddress,
        uint _tokenId,
        string memory /**tokenURI */
    ) internal virtual override {
        token.safeTransferFrom(address(this), _toAddress, _tokenId);
    }

    /// @inheritdoc IERC721Receiver
    function onERC721Received(address _operator, address, uint, bytes memory) public virtual override returns (bytes4) {
        // only allow `this` to transfer token from others
        if (_operator != address(this)) return bytes4(0);
        return IERC721Receiver.onERC721Received.selector;
    }
}
