import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import swal from "sweetalert2";
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
Vue.use(Vuex);
const web3 = new Web3(new Web3.providers.HttpProvider(import.meta.env.VUE_RPC_ENDPOINT));


const store = new Vuex.Store({
  state: {
    userAccount: "",
    isLoading: false,
    colors: { primary: "" },
    connectedWallet: false,
    loadingZIndex: 0
  },
  plugins: [createPersistedState()],
  modules: {},
  mutations: {
    connectionState(state, connection) {
      console.log("in commit: ", connection);
      state.userAccount = connection.account;
      state.connectedWallet = connection.connectedWallet;
    },
  },
  actions: {
    setUpListeners(_context, _) {
      window.addEventListener("beforeunload", function(event) {
        store.dispatch("resetState");
      });
    },
    resetState(_context, _) {
      store.commit("connectionState", {
        userAddress: "",
        connectedWallet: false
      });
    },
    async disconnectWallet(_context, _) {
      try {
        store.dispatch("resetState");
        const wallet = await store.dispatch("getAddress");
        await wallet.disconnect();
      } catch (error) {
        console.error("Error disconnecting wallet: ", error);
      }
    },
    async connectWallet() {
      store.dispatch("showLoading");
      const provider = await detectEthereumProvider();
      store.dispatch("hideLoading");

      if (provider && !(await window?.ethereum?.isConnected())) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }).catch(async (error) => {
          store.dispatch("hideLoading");
          switch (error.code) {
            case -32002:
              store.dispatch("warning", {
                warning: "Please check to see if a request to access your metamask has not been sent. It seems like you have not accepted",
              });
              break;
            case 4001:
              store.dispatch("errorWithFooterMetamask", {
                message: "Please install metamask to use the DApp",
              });
              break;
            default:
              this.isConnected = true;
              this.userAddress = web3.utils.toChecksumAddress(accounts[0]);
              break;
          }
        });
      } else if (provider && (await window?.ethereum?.isConnected())) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        store.dispatch("hideLoading");
        this.store.state.isConnected = true;
        this.store.state.userAddress = web3.utils.toChecksumAddress(accounts[0]);
      } else {
        this.errorWithFooterMetamask({
          message: "Please install metamask to use the DApp",
        });
      }
    },
    showLoading() {
      this.isLoading = true;
    },
    hideLoading() {
      this.isLoading = false;
    },
    getAddress(_context, _) {
      const isPetraInstalled = window.aptos;

      if (isPetraInstalled) {
        return window.aptos;
      } else {
        store.dispatch("errorWithFooter", {
          message: "Seems like you don't have the Petra wallet installed",
          footer: `<a href="https://petra.app/">Download Petra</a>`,
        });
        throw new Error("Petra wallet not installed");
      }
    },
    successWithCallBack(_context, message) {
      swal
        .fire({
          position: "top-end",
          icon: "success",
          title: "Success",
          showConfirmButton: true,
          text: message.message,
        })
        .then((results) => {
          if (results.isConfirmed) {
            message.onTap();
          }
        });
    },
    errorWithCallBack(_context, error) {
      swal
        .fire({
          title: "Error!",
          text: error.message,
          icon: "error",
          confirmButtonText: error.confirmButtonText,
        })
        .then((result) => {
          console.error("errorWithCallBack: ", result);
          if (result.isConfirmed) {
            error.callBack();
          }
        });
    },
    errorWithCallBackDispatch(_context, error) {
      swal
        .fire({
          title: "Error!",
          text: error.message,
          icon: "error",
          confirmButtonText: error.confirmButtonText,
        })
        .then((result) => {
          console.error("errorWithCallBack: ", result);
          if (result.isConfirmed) {
            store.dispatch(error.dispatchFunctionName);
          }
        });
    },
    success(_context, message) {
      swal.fire({
        position: "top-end",
        icon: "success",
        title: "Success",
        showConfirmButton: false,
        timer: 2500,
        text: message.message,
      });
    },
    warning(_context, warning) {
      swal.fire("Warning", warning.message, "warning").then((result) => {
        if (result.isConfirmed) {
          message.onTap();
        }
      });
    },
    error(_context, error) {
      swal.fire("Error!", error.message, "error").then((result) => {
        if (result.isConfirmed) {
          console.log("leveled");
        }
      });
    },
    successWithFooter(_context, message) {
      swal.fire({
        icon: "success",
        title: "Success",
        text: message.message,
        footer: message.footer,
      });
    },
    errorWithFooter(_context, error) {
      swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message,
        footer: error.footer,
      });
    },
  },
});

export default store;
