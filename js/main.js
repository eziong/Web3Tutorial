console.log('hello world')

/**
 * server url: https://wnxikznf764u.usemoralis.com:2053/server
 * application id: Rm7XGYfF7dGPlAV8NJo6xefMEJDTFCUwwE8atXew
 * 
 */

// connect to Moralis server

const serverUrl = "https://wnxikznf764u.usemoralis.com:2053/server";
const appId = "Rm7XGYfF7dGPlAV8NJo6xefMEJDTFCUwwE8atXew";
Moralis.start({ serverUrl, appId });

const homepage = 'http://127.0.0.1:5555/index.html';
if(Moralis.User.current() == null && window.location.href != homepage){
  document.querySelector('body').style.display = 'none';
  window.location.href = '../index.html';
}

login = async () => {
  await Moralis.authenticate().then(async function (user) {
    console.log('logged in');
    console.log(document.getElementById('user-username'))
    user.set('name',document.getElementById('user-username').value);
    user.set('email',document.getElementById('user-email').value);
    await user.save();
    window.location.href = "html/dashboard.html";
  })
}

logout = async () => {
  await Moralis.User.logOut();
  window.location.href = "../index.html" 
}

getTransactions = async () => {
  // get ETH transactions for a given address
  // with most recent transactions appearing first
  const options = {
    chain: "rinkeby",
    address: "0xB1A8080a11Dc407A5A62f2Ba5927b788E72427AC",
  };
  const transactions = await Moralis.Web3API.account.getTransactions(options);

  if(transactions.total > 0){
    const table = `
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Transaction</th>
            <th scope="col">Block Number</th>
            <th scope="col">Age</th>
            <th scope="col">Type</th>
            <th scope="col">Fee</th>
            <th scope="col">Value</th>
          </tr>
        </thed>
        <tbody id="table-body-transactions" ></tbody>
      </table>
    `
    document.getElementById('table-transactions').innerHTML = table;
    transactions.result.forEach(_transaction => {
      const content = `
        <tr>
          <td><a href="https://rinkeby.etherscan.io/tx/${_transaction.hash}" target="blank">${_transaction.hash}</a></td>
          <td><a href="https://rinkeby.etherscan.io/block/${_transaction.block_number}" >${_transaction.block_number}</a></td>
          <td>${millisecondToTime(Date.parse(new Date()) - Date.parse(_transaction.block_timestamp))}</td>
          <td>${_transaction.from_address == Moralis.User.current().get('ethAddress') ? 'Outgoing' : 'Incoming'}</td>
          <td>${((_transaction.gas * _transaction.gas_price) / 1e18).toFixed(5)}</td>
          <td>${(_transaction.value / 1e18).toFixed(5)}</td>
        </tr>
      `
      document.getElementById('table-body-transactions').innerHTML += content;
    })
  }
}

getBalances = async () => {
  const options = {
    chain: "rinkeby",
    address: "0xB1A8080a11Dc407A5A62f2Ba5927b788E72427AC",
  };
  const ethBalance = await Moralis.Web3API.account.getNativeBalance();
  const ropstenBalance = await Moralis.Web3API.account.getNativeBalance({ chain : "ropsten" });
  const rinkebyBalance = await Moralis.Web3API.account.getNativeBalance({ chain : "rinkeby" });

  const table = `
  <table class="table">
    <thead>
      <tr>
        <th scope="col">Chain</th>
        <th scope="col">Balance</th>
      </tr>
    </thed>
    <tbody id="table-body-balances" >
      <tr>
        <th>Ether</th>
        <td>${(ethBalance.balance/1e18).toFixed(5)} ETH</td>
      </tr>
      <tr>
        <th>Ropsten</th>
        <td>${(ropstenBalance.balance/1e18).toFixed(5)} ETH</td>
      </tr>
      <tr>
        <th>Rinkeby</th>
        <td>${(rinkebyBalance.balance/1e18).toFixed(5)} ETH</td>
      </tr>
    </tbody>
  </table>
  `
  document.getElementById('table-balances').innerHTML = table;
}

getNfts = async () => {
  // const nfts = await Moralis.Web3API.account.getNFTs({ chain: 'rinkeby' });
  // console.log(nfts)
}

// set listener with error checking.
setListener = (node, callback) => {
  if(node){
    node.onclick = callback;
  }
}

// set listeners
setListener(document.getElementById('btn-login'), login);
setListener(document.getElementById('btn-logout'), logout);
setListener(document.getElementById('transactions-link'), getTransactions);
setListener(document.getElementById('balances-link'), getBalances);
setListener(document.getElementById('nfts-link'), getNfts);

// utils
millisecondToTime = (ms) => {
  const minutes = (ms / (1000 * 60));
  const hours = (ms / (1000 * 60 * 60));
  const days = (ms / (1000 * 60 * 60 * 24));
  if(days < 1){
    if(hours < 1){
      if(minutes < 1){
        return 'less than a minute ago';
      }else {
        return `${Math.floor(minutes)} minute(s) ago`;
      }
    }else{
      return `${Math.floor(hours)} hour(s) ago`;
    }
  }else{
    return `${Math.floor(days)} day(s) ago`;
  }
}