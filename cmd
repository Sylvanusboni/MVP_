curl 'https://qa.interswitchng.com/quicktellerservice/api/v5/transactions/TransferFunds' \
--header 'Authentication: Bearer Token'
--header 'terminalId: 3PBL' \
--header 'Content-Type: application/json' \
--request POST \
--data-raw '{
			"transferCode":"030009998999",
			  "mac": "9f4e4f53c57be63e1f08d8f07a7bc1a9461e4a7d5304043daa1ef54bd727b6cde148f4fbfc5e2ad8c4a60f78dfa76304de671fbeb70657b1628f14b6b6baa5e1",
			  "termination": {
				"amount": "100000",
				"accountReceivable": {
				  "accountNumber": "3001155245",
				  "accountType": "00"
				},
				"entityCode": "044",
				"currencyCode": "566",
				"paymentMethodCode": "AC",
				"countryCode": "NG"
			  },
			  "sender": {
				"phone": "08124888436",
				"email": "dadubiaro@interswitch.com",
				"lastname": "Adubiaro",
				"othernames": "Deborah"
			  },
			  "initiatingEntityCode": "PBL",
			  
			  "initiation": {
				"amount": "100000",
				"currencyCode": "566",
				"paymentMethodCode": "CA",
				"channel": "7"
			  },
				"beneficiary": {
				"lastname": "ralph",
				"othernames": "ralpo"
			  }
              
			}' \
