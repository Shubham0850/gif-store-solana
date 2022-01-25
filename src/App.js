import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";
import kp from './keypair.json'

import idl from "./idl.json";

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl("devnet");

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed",
};

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
// const TEST_GIFS = [
//   "https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp",
//   "https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g",
//   "https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g",
//   "https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp",
// ];

const App = () => {
  const [walletAdrs, setWalletAdrs] = useState(null);
  const [inpValue, setInpValue] = useState("");
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

  const getGifList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      console.log("Got the account", account);
      setGifList(account.gifList);
    } catch (error) {
      console.log("Error in getGifList: ", error);
      setGifList(null);
    }
  };

  useEffect(() => {
    if (walletAdrs) {
      console.log("Fetching GIF list...");
      getGifList();
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
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping");
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log(
        "Created a new BaseAccount w/ address:",
        baseAccount.publicKey.toString()
      );
      await getGifList();
    } catch (error) {
      console.log("Error creating BaseAccount account:", error);
    }
  };

  // send Gif to Solana Network
  const sendGif = async () => {
    if (inpValue.length === 0) {
      console.log("No gif link given!")
      return
    }
    setInpValue('');
    console.log('Gif link:', inpValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
  
      await program.rpc.addGif(inpValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("GIF successfully sent to program", inpValue)
  
      await getGifList();
    } catch (error) {
      console.log("Error sending GIF:", error)
    }
  };

  return (
    <div className="App">
      <div className={walletAdrs ? "authed-container" : "container"}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          <p className="sub-text">
            Wallet Address: 0x{walletAdrs}
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
                <input
                  type="text"
                  value={inpValue}
                  onChange={onInpChange}
                  placeholder="Enter gif link!"
                />
                <button type="submit" className="cta-button submit-gif-button">
                  Submit
                </button>
              </form>

              {!gifList ? (
                <button
                  className="cta-button submit-gif-button"
                  onClick={createGifAccount}
                >
                  Do One-Time Initialization For GIF Program Account
                </button>
              ) : (
                <div className="gif-grid">
                  {gifList.map((gif) => (
                    <div className="gif-item" key={gif}>
                      <img src={gif.gifLink} alt={gif} />
                    </div>
                  ))}
                </div>
              )}
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
