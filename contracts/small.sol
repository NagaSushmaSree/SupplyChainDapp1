//SPDX-License-Identifier:MIT
pragma solidity ^0.8.17;
contract simple {
    uint32 public key;

    function set(uint32 _val)  public  {
        key = _val;
    }

    function get() view  public returns(uint32){
        return key;
    }
}