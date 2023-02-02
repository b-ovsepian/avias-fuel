# avias-fuel

This app will check the availability of fuel at the specified gas station and send a notification about the availability of a certain fuel with a price.

## Installation

1. Clone the repository
2. run `yarn`
3. create a file `.env` in the root of the project and add the following variables:

```
SITE_URL = https://fuel.avias.ua/
PHONE_NUMBER = your phone number in the format 380XXXXXXXXX (https://fuel.avias.ua/)
PASSWORD = your password (https://fuel.avias.ua/)
PUSHOVER_TOKEN = your pushover token (https://pushover.net/)
PUSHOVER_USER = your pushover user (https://pushover.net/)
FUEL = 95 (fuel type)
REGION = SU (first two uppercase letters of the region)
GAS_STATION = B44 (gas station code)
```

4. run `yarn start`

## List of fuel types:

Diesel -> 11

Gas -> 30

A92 Energy -> 92

A95 -> 95

A95 Energy -> 96

A98 -> 98
