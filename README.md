# Airtable Automation <!-- omit in toc -->

## Contents <!-- omit in toc -->

- [Guide](#guide)
  - [Checkout Repository](#checkout-repository)
  - [Install Dependencies](#install-dependencies)
  - [Get Secret Files](#get-secret-files)
  - [Build project](#build-project)
  - [Run](#run)

## Guide

### Checkout Repository

```shell
git clone https://github.com/YashTotale/airtable-automation.git
cd airtable-automation
```

### Install Dependencies

```shell
npm install
```

### Get Secret Files

- Login to Google Drive with avhack4impact@gmail.com
- Navigate to the 'Secret Files' folder in the 'Airtable Automation' folder ([Link](https://drive.google.com/drive/folders/1kcdNls8krOBnIpDNls-hBxsc3yjfPiiB))
- Copy Files:
  - `.env` file to your root folder
  - `serviceaccount.json` file to `src/Config/serviceaccount.json`

### Build project

```shell
npm run build
```

### Run

```shell
npm run make
```