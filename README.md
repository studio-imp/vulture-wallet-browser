<h1 align="center">⚠️!DEPRECATED! - The vulture project is deprecated ⚠️</h1>


<h2 align="center">Vulture Wallet | Browser Version</h1>
<p align='center'>
<img src="./public/icons/VultureIcon2.png" alt="Example 1" width="8%"> 
</p>

<h3 align="center">
Sleek, open-source, non-custodial & multi-chain Crypto Wallet.
</h3>

<p align="center">
Vulture is an open-source cryptocurrency wallet that aims to become a general interface for blockchain,
primarily made for Aleph Zero, but with a strong focus on supporting multi-chain.
</p>

____

### Things to Note

* Vulture is developed by psycoders.club *(previously xavax)*
* Vulture will support the Ledger hardware wallet in the near future, you will be able to use both non-hardware mnemonic accounts & Ledger accounts simultaneously.
* Vulture currently only has a browser extension version, but a mobile wallet is in development.

### Branches

Vulture has three main branches:

* `Dev` - The dev branch has frequent rolling updates, this version likely has new features that are buggy,
the wallet may even be in an unfinished state here; crazy things happen in this branch.
* `Nightly` - The nightly branch contains a release candidate version of the next Vulture update, it might be *(probably is)* buggy .
* `Master` - The master branch contains the version of Vulture as you can find in the Chrome Web Store or any web extension store.

The `Dev` branch is the default branch as all the high-octane developin' happens there.
Other branches for very feature-specific things may likely arrise with time and will be merged with `Dev`.

<h1 align="center"> ~ For The Devs ~ </h1>


## Build Requirements:

You will need: `Nodejs`, `NPM`, `Yarn`, and `Vue Cli (>5.0.0)`,

Install yarn: `npm i -g yarn`

Install vue cli: `npm i -g @vue/cli`


## Build Vulture

After you've cloned `git clone https://github.com/psycoders-club/vulture-wallet-browser` the repository into a directory, run `yarn install` in the directory to install all dependencies. 

To build Vulture run `yarn build`

This will build the wallet into the `dist` folder.
Building everytime you make a change is slow, so if you want to develop I recommend that you run `yarn serve`.

This will launch a locally-hosted webserver where you can test the wallet in a web-page and make changes accordingally.

### Scripts & Webworkers:

All the heavy-lifting such as RPC calls and cryptography is done in WebWorkers, the code for these are located seperately in the `vulture_scripts` directory.

> If you edit one of these scripts, you'll need to build them manually by running `yarn build-scripts`.

This will pack, build, and place the scripts in the `public` directory. `yarn build` will automatically build
the latest scripts and place them in the `dist` directory.

<h1 align="center"> ~ Licensing ~ </h1>

Vulture is licensed under the permissive [MIT License](https://mit-license.org/). If you have any questions
about licensing, feel free to ask on social media, github issues, or send an email to `info@psycoders.club`.
