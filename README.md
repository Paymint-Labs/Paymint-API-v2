# Paymint-API-v2

NOTE: I'm filling out the documentation as fast as I can but this is a time consuming process so please be patient with me

</br>

## A Quick Overview

- Firebase cloud functions for data retrieval and processing
- Firestore to store price quotes on user transactions
- Fully self-deployable
- Supports custom [Esplora-Electrs](https://github.com/Blockstream/electrs) servers
- Open source, minimal and privacy preserving wallet analytics
- Documentation available

</br>

## Endpoint Overview

---

### Main Endpoints

| Endpoint Name | Description                                                                                                                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| /txData       | Fetches transaction data associated with the wallet. Grouped and organised by date. Allows custom Electrs-Esplora endpoint to be specified                                                                                                 |
| /voutLookup   | Returns the address specified at the index of the output, both of which are passed onto the endpoint. Allows custom Electrs-Esplora endpoint to be specified.                                                                              |
| /pushtx       | Broadcasts the transaction hex passed to the function to main network. Allows custom Esplora-Electrs endpoint to be specified.                                                                                                             |
| /outputData   | Fetches balance and output information for the wallet. It takes in an array of the addresses the wallet controls and the currency that the user would like pricing information in. Allows custom Esplora-Electrs endpoint to be specified. |

---

### Miscellaneous Endpoints

</br>
