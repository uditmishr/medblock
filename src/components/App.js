import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import logo from './logo.png';
import { create } from 'ipfs-http-client'
import record from '../abis/record.json'

const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'}) // leaving out the arguments will default to these values

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }
  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = record.networks[networkId]
    if (networkData) {
      const contract = web3.eth.Contract(record.abi, networkData.address)
      this.setState({ contract })
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  constructor(props) {
    super(props)

    this.state = {

      recHash: '',
      contract: null,
      web3: null,
      buffer: null,
      account: null,
      idt: null

    }
  }
  captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {

      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)

    }
  }
  onSubmit = (event) => {
    event.preventDefault()
    const id = document.getElementById("id").value
    const name = document.getElementById("fname").value
    const email = document.getElementById("email").value
    const gen = document.getElementById("gen").value
    const phone = document.getElementById("phone").value
    const date = document.getElementById("date").value
    const temp = document.getElementById("temp").value

    const data = {
      tid: id,
      name: name,
      email: email,
      gen: gen,
      phone: phone,
      date: date,
      temp: temp,
      photo: this.state.buffer,


    };
    const ds = JSON.stringify(data)

    console.log(ds)
    console.log("Submitting file to ipfs...")
    ipfs.add(ds).then((res) => {
      this.setState({ recHash: res.path })
      //const hash = res.path
      //console.log(this.state.recHash)
      this.state.contract.methods.set(id, this.state.recHash).send({ from: this.state.account })
    })


  }

  getResult = (event) => {
    event.preventDefault();
    if (document.getElementById("id1").value == '') {
      alert("Input Id is blank")
    }
    function read(some) {
      console.log(some)
      const s = some;
      //this.setState({recHash:s})
      function record(obj) {
        const stream = obj;
        //creating jpeg from array buffer
        let a = new Uint8Array(stream.photo.data)//chaging into arraybufferview
        let blob = new Blob([a], { type: "image/jpeg" })
        var urlCreator = window.URL || window.webkitURL;
        var imageUrl = urlCreator.createObjectURL(blob);

        let html = ` <table>
              <tr>
                  <td rowspan=7 align="center"><img src="${imageUrl}" width="50%" height="50%"></img></td>
                  <td align="Left"><b>Id:</b> ${stream.tid}</td>
              </tr>
              <tr>
                  <td align="Left"><b>Name:</b> ${stream.name}</td>
              </tr>
              <tr>
                  <td align="Left"><b>Email:</b> ${stream.email}</td>
              </tr>
              <tr>
                  <td align="Left"><b>Gender:</b> ${stream.gen}</td>
              </tr>
              <tr>
                  <td align="Left"><b>Phone:</b> ${stream.phone}</td>
              </tr>
              <tr>
                  <td align="Left"><b>Date:</b> ${stream.date}</td>
              </tr>
              <tr>
                  <td align="Left"><b>Temperature:</b> ${stream.temp}</td>
              </tr>
              </table>`;
        document.getElementById('result').innerHTML = html;

      }
      //const url= `https://ipfs.infura.io/ipfs/QmYM5vqVTgfUTsaMeqhJ8JJeesYPGoPdup6iij8iu8bZ6x`
      //console.log(this.state.recHash)
      const url = `https://ipfs.infura.io/ipfs/${s}`
      console.log(url);


      fetch(url)
        .then(response => response.json())
        .then(data => record(data))
    }
    const idm = document.getElementById("id1").value
    const hash = this.state.contract.methods.get(idm).call()
    hash.then(
      function (value) { read(value); }
    );







  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <div className="container-fluid">
            <ul className="nav">
              <li>
                &nbsp;
                <img className=" my-2" src={logo} width="30" height="30" />
              </li>
              <li>
                &nbsp;&nbsp;
                <a className="my-1 navbar-brand text-white">
                  <b>
                    MedBlock
                  </b>
                </a>
              </li>
            </ul>
            <span className="navbar-text text-white">
              Account : {this.state.account}
            </span>
          </div>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <div className="col-sm">
              <div className="container p-3 bg-light shadow rounded">
                <h2>Enter Details</h2><hr />
                <form onSubmit={this.onSubmit}>
                  <b>
                    <label for="id">Id:</label><br />
                    <input type="number" id="id" className="form-control" /><br />
                    <label for="fname">Name:</label><br />
                    <input type="text" id="fname" className="form-control" /><br />
                    <label for="email">Email:</label><br />
                    <input type="email" id="email" className="form-control" /><br />
                    <label for="gen">Gender:</label><br />
                    <input type="text" id="gen" className="form-control" /><br />
                    <label for="phone">Phone Number:</label><br />
                    <input type="tel" id="phone" className="form-control" /><br />
                    <label for="date">Date:</label><br />
                    <input type="date" id="date" className="form-control" /><br />
                    <label for="temp">Temperature:</label><br />
                    <input type="number" id="temp" placeholder='Temperature in Fahrenheit' className="form-control" /><br />
                    <input type="file" id="photo" className="form-control p-1" onChange={this.captureFile} /><br />
                    <br />
                  </b>
                  <input type="submit" className="btn btn-primary" /> &nbsp;
                  <input type="reset" className="btn btn-primary" /><br />
                </form>
              </div>
            </div>
            <div className="col-sm">
              <div className="container p-3 bg-light shadow rounded">
                <h2>Get Details</h2><hr />
                <form>
                  <label for="id1"><b>Id:</b></label><br />
                  <input type="number" id="id1" className="form-control" /><br />

                  <input className="btn btn-primary" type="button" value=" Get Details" onClick={this.getResult} /> &nbsp;
                  <input type="reset" className="btn btn-primary" /><br />
                  <hr />
                  <div id="result">

                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
