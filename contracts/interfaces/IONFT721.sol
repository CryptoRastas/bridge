// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0;

import "./IONFT721Core.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

/**
 * @dev Interface of the ONFT standard
 */
interface IONFT721 is IONFT721Core, IERC721, IERC721Metadata {

}
