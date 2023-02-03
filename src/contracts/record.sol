pragma solidity ^0.5.0;
contract record{
    struct file{
        uint id;
        string hash;
    }
    file f;  

	mapping(uint => file) fileList;

 
	function set(uint file_id,string memory _file_hash)public{

		 f.hash=_file_hash;
         f.id=file_id;
         
        fileList[file_id] = f;
         
         }
	

 
	 function get(uint file_id) public view returns (string memory _file_hash){
         
         file memory f = fileList[file_id];
         
     return(f.hash);
    
     }
}