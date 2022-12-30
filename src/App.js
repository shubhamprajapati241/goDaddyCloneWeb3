import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Search from "./components/Search";
import Domain from "./components/Domain";

// ABIs
import ETHDaddy from "./abis/ETHDaddy.json";

// Config
import config from "./config.json";

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);

  const [ethDaddy, setEthDaddy] = useState(null);
  const [domains, setDomains] = useState([]);

  const loadBlockchainData = async () => {
    // settinp account from metamask
    window.ethereum.on("accountsChanged", async () => {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });

    // connecting with ethereum blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    const network = await provider.getNetwork();

    // connecting with the contract
    const ethDaddy = new ethers.Contract(
      config[network.chainId].ETHDaddy.address, // contract address
      ETHDaddy, // contract
      provider // provider
    );
    setEthDaddy(ethDaddy);
    const maxSupply = await ethDaddy.maxSupply();

    const domains = [];
    for (var i = 1; i <= maxSupply; i++) {
      const domain = await ethDaddy.getDomains(i);
      domains.push(domain);
    }
    setDomains(domains);
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />
      <div className="cards__section">
        <h2 className="cards__title">Why we need a domain name ? </h2>
        <p className="cards_description">
          Own your custom username, use it accros service, and be able to store
          an avatar and other profile data.
        </p>

        <hr />

        <div className="cards">
          {domains.map((domain, index) => (
            <Domain
              domain={domain}
              ethDaddy={ethDaddy}
              provider={provider}
              id={index + 1}
              key={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
