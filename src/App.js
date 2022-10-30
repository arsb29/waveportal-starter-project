import React, { useEffect, useState } from 'react';
import {ethers} from 'ethers';
import abi from './utils/WavePortal.json';
import './App.css';

const getEthereumObject = () => window.ethereum;

/*
 * This function returns the first linked account found.
 * If there is no account linked, it will return null.
 */
const findMetaMaskAccount = async () => {
    try {
        const ethereum = getEthereumObject();

        /*
         * First make sure we have access to the Ethereum object.
         */
        if (!ethereum) {
            console.error("Make sure you have Metamask!");
            return null;
        }

        console.log("We have the Ethereum object", ethereum);
        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found an authorized account:", account);
            return account;
        } else {
            console.error("No authorized account found");
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
};

const App = () => {
    const [currentAccount, setCurrentAccount] = useState('');
    const contractAddress = '0xfd34f821EF7F1e38d0BA4208c39Ec2A398896689';
    const contractABI = abi.abi;

    const connectWallet = async () => {
        try {
            const ethereum = getEthereumObject();
            if (!ethereum) {
                alert("Get MetaMask!");
                return;
            }

            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            });

            console.log("Connected", accounts[0]);
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.error(error);
        }
    };

    const wave = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

                let count = await wavePortalContract.getTotalWaves();
                console.log("Retrieved total wave count...", count.toNumber());

                /*
                * Execute the actual wave from your smart contract
                */
                const waveTxn = await wavePortalContract.wave();
                console.log("Mining...", waveTxn.hash);

                await waveTxn.wait();
                console.log("Mined -- ", waveTxn.hash);

                count = await wavePortalContract.getTotalWaves();
                console.log("Retrieved total wave count...", count.toNumber());
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    }

    /*
     * This runs our function when the page loads.
     * More technically, when the App component "mounts".
     */
    useEffect(() => {
        const setAccount = async () => {
            const account = await findMetaMaskAccount();
            if (account !== null) {
                setCurrentAccount(account);
            }
        }
        setAccount();
    }, []);

    return (
        <div className="mainContainer">
            <div className="dataContainer">
                <div className="header">
                    <span role="img" aria-label="">👋</span> Hey there!
                </div>

                <div className="bio">
                    I am Farza and I worked on self-driving cars so that's pretty cool
                    right? Connect your Ethereum wallet and wave at me!
                </div>

                <button className="waveButton" onClick={wave}>
                    Wave at Me
                </button>

                {/*
         * If there is no currentAccount render this button
         */}
                {!currentAccount && (
                    <button className="waveButton" onClick={connectWallet}>
                        Connect Wallet
                    </button>
                )}
            </div>
        </div>
    );
};

export default App;