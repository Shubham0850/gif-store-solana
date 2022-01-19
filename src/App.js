import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import { useEffect, useState } from "react";

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TEST_GIFS = [
  "https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp",
  "https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g",
  "https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g",
  "https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp",
];

const App = () => {
  const [walletAdrs, setWalletAdrs] = useState(null);
  const [inpValue, setInpValue] = useState('');
  const [gifList, setGifList] = useState([]);

  // Check if PHANTOM wallet is connected or not
  const checkWallet = async () => {
    try {
      const { solana } = window;

      if (solana) {
        console.log(solana);
        if (solana.isPhantom) {
          console.log("Phantom wallet is available");

          // checking if user is already loged in
          const res = await solana.connect({ onlyIfTrusted: true });
          console.log("Connected with public key", res.publicKey.toString());

          setWalletAdrs(res.publicKey.toString());
        }
      } else {
        console.log("wallet not found, please download it");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const onLoad = async () => {
      await checkWallet();
    };

    window.addEventListener("load", onLoad);

    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    if(walletAdrs){
      setGifList(TEST_GIFS);
    }
  }, [walletAdrs]);

  // Authenticate user
  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const res = await solana.connect();

      console.log("connected public key:", res.publicKey.toString());

      setWalletAdrs(res.publicKey.toString());
    }
  };

  // handle input 
  const onInpChange = (e) => {
    setInpValue(e.target.value);
  }

  // send Gif to Solana Network
  const sendGif = async () => {
    if(inpValue.length > 0){
      // send gif

    } else {
      alert("please provide the link");
    }
  }

  return (
    <div className="App">
      <div className={walletAdrs ? "authed-container" : "container"}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!walletAdrs && (
            <button onClick={connectWallet} className="btn">
              Connect Your Phantom Wallet
            </button>
          )}

          {walletAdrs && (
            <div className="connected-container">
            {/* Go ahead and add this input and button to start */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendGif();
              }}
            >
              <input type="text" value={inpValue} onChange={onInpChange} placeholder="Enter gif link!" />
              <button type="submit" className="cta-button submit-gif-button">Submit</button>
            </form>
            <div className="gif-grid">
              {gifList.map((gif) => (
                <div className="gif-item" key={gif}>
                  <img src={gif} alt={gif} />
                </div>
              ))}
            </div>
          </div>
        
          )}

        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
