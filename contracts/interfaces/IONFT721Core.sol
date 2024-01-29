// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @dev Interface of the ONFT Core standard
 * @dev please read the docs about this override in @layerzerolabs/solidity-examples/contracts/token/onft721/interfaces/IONFT721Core.sol
 *      in order to implement metadata, we modified the original version
 */
interface IONFT721Core is IERC165 {
    event SendToChain(uint16 indexed _dstChainId, address indexed _from, bytes indexed _toAddress, uint[] _tokenIds);
    event ReceiveFromChain(
        uint16 indexed _srcChainId,
        bytes indexed _srcAddress,
        address indexed _toAddress,
        uint[] _tokenIds
    );
    event SetMinGasToTransferAndStore(uint _minGasToTransferAndStore);
    event SetDstChainIdToTransferGas(uint16 _dstChainId, uint _dstChainIdToTransferGas);
    event SetDstChainIdToBatchLimit(uint16 _dstChainId, uint _dstChainIdToBatchLimit);
    event CreditStored(bytes32 _hashedPayload, bytes _payload);
    event CreditCleared(bytes32 _hashedPayload);

    function sendFrom(
        address _from,
        uint16 _dstChainId,
        bytes calldata _toAddress,
        address _ERC721Address,
        uint _tokenId,
        address payable _refundAddress,
        address _zroPaymentAddress,
        bytes calldata _adapterParams
    ) external payable;

    function sendBatchFrom(
        address _from,
        uint16 _dstChainId,
        bytes calldata _toAddress,
        address _ERC721Address,
        uint[] calldata _tokenIds,
        address payable _refundAddress,
        address _zroPaymentAddress,
        bytes calldata _adapterParams
    ) external payable;

    function estimateSendFee(
        uint16 _dstChainId,
        bytes calldata _toAddress,
        address _ERC721Address,
        uint _tokenId,
        bool _useZro,
        bytes calldata _adapterParams
    ) external view returns (uint nativeFee, uint zroFee);

    function estimateSendBatchFee(
        uint16 _dstChainId,
        bytes calldata _toAddress,
        address _ERC721Address,
        uint[] calldata _tokenIds,
        bool _useZro,
        bytes calldata _adapterParams
    ) external view returns (uint nativeFee, uint zroFee);
}
