pragma solidity ^0.5.0;

contract XmasTree {
  struct Lamp {
    uint64 id;
    string creater;
    bytes32 info;
    uint8 score;
  }

  address payable public founder;
  uint256 public userCount;
  mapping (uint64 => bool) private _users;
  mapping (uint64 => bool) private _treeExist;
  uint64[] public trees;
  mapping (uint64 => string) private _treeOwner;
  mapping (uint64 => Lamp[]) private _treeLamps;
  mapping (uint64 => mapping (uint64 => uint256)) private _lampIndex;

  uint256 private _minTopLampsCount;
  uint64[] private _topTen;
  mapping (uint64 => bool) private _isTopTree;

  constructor () public {
    founder = msg.sender;
  }

  function treeCount () public view returns (uint256) {
    return trees.length;
  }

  function topTen () public view returns (uint64[] memory) {
    return _topTen;
  }

  function genID (address _input) private pure returns (uint64) {
    return uint64(bytes8(bytes20(_input)));
  }

  function createNewTree (
    string memory _username
  ) public {
    uint64 id = genID(msg.sender);
    require(_treeExist[id] == false);
    if (_users[id] == false) {
      _users[id] = true;
      userCount++;
    }
    trees.push(id);
    _treeExist[id] = true;
    _treeOwner[id] = _username;
  }

  function addNewLamp (
    uint64 _treeID,
    string memory _creater,
    bytes32 _info,
    uint8 _score
  ) public {
    require(_treeExist[_treeID] == true);
    uint64 userID = genID(msg.sender);
    require(_lampIndex[_treeID][userID] == 0);
    if (_users[userID] == false) {
      _users[userID] = true;
      userCount++;
    }
    Lamp memory newLamp = Lamp({
      id: userID,
      creater: _creater,
      info: _info,
      score: _score
    });
    _treeLamps[_treeID].push(newLamp);
    uint256 length = _treeLamps[_treeID].length;
    _lampIndex[_treeID][userID] = length;
    if (length >= _minTopLampsCount) {
      if (_isTopTree[_treeID]) {
        sort();
      } else {
        _isTopTree[_treeID] = true;
        _topTen.push(_treeID);
        sort();
        if (_topTen.length > 10) {
          _isTopTree[_topTen[10]] = false;
          _topTen.length = 10;
        }
      }
      _minTopLampsCount = _treeLamps[_topTen[_topTen.length - 1]].length;
    }
  }

  function sort () private {
    uint8 i =  uint8(_topTen.length) - 1;
    for (; i > 0; i--) {
      if (_treeLamps[_topTen[i]].length > _treeLamps[_topTen[i - 1]].length) {
        uint64 temp = _topTen[i - 1];
        _topTen[i - 1] = _topTen[i];
        _topTen[i] = temp;
      }
    }
  }

  function getTreeInfo (uint64 _treeID) public view returns (
    bool treeExist,
    string memory owner,
    uint64[] memory lampIDs,
    uint8[] memory scores
  ) {
    treeExist = _treeExist[_treeID];
    owner = _treeOwner[_treeID];
    Lamp[] storage lamps = _treeLamps[_treeID];
    uint256 length = lamps.length;
    lampIDs = new uint64[](length);
    scores = new uint8[](length);
    for (uint256 i = 0; i < length; i++) {
      Lamp storage lamp = lamps[i];
      lampIDs[i] = lamp.id;
      scores[i] = lamp.score;
    }
  }

  function getLampInfo (
    uint64 _treeID,
    uint64 _lampID
  ) public view returns (
    string memory creater,
    bytes32 info,
    uint8 score
  ) {
    uint256 index = _lampIndex[_treeID][_lampID] - 1;
    Lamp storage lamp = _treeLamps[_treeID][index];
    return (lamp.creater, lamp.info, lamp.score);
  }

  function getRankInfo (uint64 _treeID) public view returns (
    string memory owner,
    uint256 count
  ) {
    owner = _treeOwner[_treeID];
    count = _treeLamps[_treeID].length;
  }

  function kill () public {
    require(msg.sender == founder);
    selfdestruct(founder);
  }
}
