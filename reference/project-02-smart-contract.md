# Project 2: Smart Contract

## Informasi Umum

| Item                         | Detail                     |
| ---------------------------- | -------------------------- |
| **Nama Project**       | Smart Contract Development |
| **Modul Terkait**      | Module 07-11               |
| **Video Pembelajaran** | Video 7, 8, 9              |
| **Minggu Demo**        | Minggu 12                  |

## Deskripsi

Pada project ini, mahasiswa akan mengembangkan **smart contract** menggunakan **Solidity** dan **Hardhat**. Smart contract harus di-deploy ke local blockchain dan dapat diinteraksikan menggunakan **MetaMask**.

## Tujuan Pembelajaran

Setelah menyelesaikan project ini, mahasiswa mampu:

1. Merancang dan mengimplementasikan smart contract sesuai use case
2. Menulis kode Solidity dengan best practices
3. Melakukan unit testing yang komprehensif
4. Deploy smart contract ke local blockchain
5. Berinteraksi dengan smart contract via MetaMask

## Pilihan Tema Project

Pilih **salah satu** tema berikut atau ajukan tema sendiri (dengan persetujuan dosen):

### Tema 1: Course Reward System

**Deskripsi:** Sistem reward untuk mahasiswa yang menyelesaikan kursus.

**Fitur Wajib:**

- Owner (dosen) bisa set reward amount
- Mahasiswa bisa claim reward (sekali saja)
- Tracking siapa saja yang sudah claim
- Event logging

**Fitur Bonus:**

- Whitelist mahasiswa yang boleh claim
- Deadline claim
- Multiple reward tiers

### Tema 2: Simple Voting

**Deskripsi:** Sistem voting untuk pemilihan (ketua kelas, proposal, dll).

**Fitur Wajib:**

- Owner bisa membuat proposal/kandidat
- User bisa vote (sekali per user)
- Menampilkan hasil voting
- Event saat vote

**Fitur Bonus:**

- Deadline voting
- Minimum quorum
- Weighted voting

### Tema 3: Todo List On-Chain

**Deskripsi:** Aplikasi todo list yang tersimpan di blockchain.

**Fitur Wajib:**

- User bisa tambah todo
- User bisa tandai selesai
- User bisa hapus todo
- Setiap user punya list sendiri

**Fitur Bonus:**

- Deadline per todo
- Priority level
- Shared todo list

### Tema 4: Simple Escrow

**Deskripsi:** Layanan escrow untuk transaksi aman antara dua pihak.

**Fitur Wajib:**

- Buyer deposit dana
- Seller deliver (konfirmasi)
- Buyer release atau dispute
- Refund mechanism

**Fitur Bonus:**

- Arbiter untuk dispute
- Timeout auto-refund
- Partial release

### Tema 5: Token Sederhana

**Deskripsi:** Token cryptocurrency sederhana (mirip ERC-20 yang disederhanakan).

**Fitur Wajib:**

- Transfer token antar user
- Check balance
- Owner bisa mint
- Total supply tracking

**Fitur Bonus:**

- Burn mechanism
- Allowance (approve + transferFrom)
- Pausable

### Tema 6: Crowdfunding

**Deskripsi:** Platform penggalangan dana dengan target dan deadline.

**Fitur Wajib:**

- Creator buat campaign dengan target
- User bisa donate
- Refund jika target tidak tercapai
- Withdraw jika target tercapai

**Fitur Bonus:**

- Multiple campaigns
- Milestone-based release
- Reward tiers

---

## Spesifikasi Teknis

### Struktur Project

```
project-smart-contract/
├── contracts/
│   └── NamaContract.sol        # Smart contract utama
├── test/
│   └── NamaContract.test.js    # Unit tests
├── scripts/
│   ├── deploy.js               # Deployment script
│   └── interact.js             # Interaction script (opsional)
├── hardhat.config.js           # Konfigurasi Hardhat
├── package.json
└── README.md                   # Dokumentasi project
```

### Requirement Smart Contract

| Komponen                  | Minimum | Contoh                                              |
| ------------------------- | ------- | --------------------------------------------------- |
| **State Variables** | 3       | `owner`, `rewardAmount`, `mapping`            |
| **Functions**       | 4       | `claim()`, `setAmount()`, `getBalance()`, dll |
| **Modifiers**       | 1       | `onlyOwner`                                       |
| **Events**          | 2       | `RewardClaimed`, `AmountChanged`                |
| **Mappings**        | 1       | `mapping(address => uint256)`                     |

### Requirement Testing

| Komponen                  | Minimum                                                |
| ------------------------- | ------------------------------------------------------ |
| **Test Cases**      | 8 test cases                                           |
| **Coverage**        | 80% (disarankan)                                       |
| **Test Categories** | Deployment, Positive, Negative, Access Control, Events |

### Contoh Struktur Test

```javascript
describe("NamaContract", function () {
  describe("Deployment", function () {
    it("should set correct owner");
    it("should initialize with correct values");
  });

  describe("Main Function", function () {
    it("should work correctly (positive test)");
    it("should fail when invalid (negative test)");
    it("should emit correct event");
  });

  describe("Access Control", function () {
    it("should allow owner to call restricted function");
    it("should reject non-owner");
  });
});
```

---

## Deliverables

### 1. Source Code (GitHub Repository)

Repository harus berisi:

- [ ] `contracts/` - Smart contract Solidity
- [ ] `test/` - Unit test lengkap
- [ ] `scripts/` - Deployment script
- [ ] `hardhat.config.js` - Konfigurasi
- [ ] `README.md` - Dokumentasi
- [ ] `.gitignore` - Exclude node_modules, artifacts, cache

### 2. README.md

README harus mencakup:

```markdown
# Nama Project

## Deskripsi
[Penjelasan singkat project]

## Anggota Kelompok
- Nama 1 (NRP)
- Nama 2 (NRP)

## Fitur
- Fitur 1
- Fitur 2
- ...

## Cara Menjalankan

### Prerequisites
- Node.js v18+
- npm atau pnpm

### Installation
npm install

### Compile
npx hardhat compile

### Test
npx hardhat test

### Deploy (Local)
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

## Contract Address
[Alamat contract setelah deploy]

## Screenshot
[Screenshot bukti demo]
```

### 3. Screenshot Bukti

| Screenshot         | Keterangan                         |
| ------------------ | ---------------------------------- |
| Compile berhasil   | `npx hardhat compile`            |
| Test passing       | `npx hardhat test` (semua hijau) |
| Deploy berhasil    | Output contract address            |
| MetaMask connected | Network Hardhat Local              |
| Transaksi berhasil | Minimal 2 transaksi berbeda        |
| State berubah      | Bukti perubahan data di contract   |

---

## Rubrik Penilaian

| Komponen                 | Bobot | Kriteria                                                     |
| ------------------------ | ----- | ------------------------------------------------------------ |
| **Smart Contract** | 30%   | Kode berjalan tanpa error, fitur lengkap, best practices     |
| **Testing**        | 25%   | Minimal 8 test case, coverage >80%, test positive & negative |
| **Deployment**     | 15%   | Berhasil deploy ke local network, script berfungsi           |
| **Interaksi**      | 15%   | Demo interaksi via MetaMask berhasil                         |
| **Dokumentasi**    | 10%   | README lengkap, kode terdokumentasi                          |
| **Presentasi**     | 5%    | Penjelasan jelas, menjawab pertanyaan                        |

### Detail Penilaian Smart Contract (30%)

| Nilai      | Kriteria                                             |
| ---------- | ---------------------------------------------------- |
| A (90-100) | Semua fitur wajib + bonus, kode clean, gas efficient |
| B (80-89)  | Semua fitur wajib, kode readable                     |
| C (70-79)  | Sebagian besar fitur, ada minor bugs                 |
| D (60-69)  | Fitur minimal, banyak bugs                           |
| E (<60)    | Tidak berfungsi                                      |

### Detail Penilaian Testing (25%)

| Nilai      | Kriteria                                 |
| ---------- | ---------------------------------------- |
| A (90-100) | >10 test, coverage >90%, test edge cases |
| B (80-89)  | 8-10 test, coverage >80%                 |
| C (70-79)  | 5-7 test, coverage >60%                  |
| D (60-69)  | <5 test, coverage <60%                   |
| E (<60)    | Tidak ada test                           |

---

## Timeline

| Minggu              | Aktivitas                                         |
| ------------------- | ------------------------------------------------- |
| **Minggu 8**  | Belajar konsep smart contract (Module 07-08)      |
| **Minggu 9**  | Setup Hardhat, mulai coding (Module 09 / Video 7) |
| **Minggu 10** | Testing & deployment (Module 10-11 / Video 8-9)   |
| **Minggu 11** | **Demo Project**                            |

---

## Tips Pengerjaan

### Do's ✅

1. **Mulai dari yang simple** - Buat contract minimal dulu, tambah fitur bertahap
2. **Test frequently** - Jalankan test setiap selesai satu fungsi
3. **Commit often** - Commit ke Git setiap milestone kecil
4. **Read error messages** - Solidity compiler cukup informatif
5. **Use events** - Untuk tracking dan debugging

### Don'ts ❌

1. **Jangan copy-paste tanpa paham** - Pahami setiap baris kode
2. **Jangan skip testing** - Testing adalah 25% nilai
3. **Jangan hardcode address** - Gunakan `msg.sender` atau parameter
4. **Jangan lupa gas** - Perhatikan gas efficiency
5. **Jangan tunggu deadline** - Mulai dari minggu 9

---

## Contoh Contract Sederhana

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleProject {
    // State variables
    address public owner;
    uint256 public value;
    mapping(address => bool) public hasInteracted;

    // Events
    event ValueChanged(uint256 oldValue, uint256 newValue, address changedBy);
    event UserInteracted(address indexed user);

    // Modifier
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // Constructor
    constructor(uint256 _initialValue) {
        owner = msg.sender;
        value = _initialValue;
    }

    // Functions
    function setValue(uint256 _newValue) external onlyOwner {
        uint256 oldValue = value;
        value = _newValue;
        emit ValueChanged(oldValue, _newValue, msg.sender);
    }

    function interact() external {
        require(!hasInteracted[msg.sender], "Already interacted");
        hasInteracted[msg.sender] = true;
        emit UserInteracted(msg.sender);
    }

    function getValue() external view returns (uint256) {
        return value;
    }
}
```

---

## FAQ

### Q: Boleh pakai OpenZeppelin?

**A:** Boleh untuk fitur bonus, tapi pahami dulu implementasi manual.

### Q: Harus deploy ke testnet (Sepolia)?

**A:** Tidak wajib. Local network (Hardhat/Ganache) sudah cukup.

### Q: Boleh tema di luar pilihan?

**A:** Boleh, dengan persetujuan dosen. Kompleksitas harus setara.

### Q: Bagaimana jika test tidak 100% passing?

**A:** Perbaiki bug atau jelaskan known issues di README.

### Q: Apakah perlu frontend?

**A:** Tidak untuk Project 2. Frontend akan dibuat di Project Akhir (dApp).

---

## Referensi

- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Module 09 - Hardhat Setup](../module-09.md)
- [Module 10 - Testing](../module-10.md)
- [Module 11 - Deployment](../module-11.md)
- [Video Smart Contract](../Smart%20Contract/video-smart-contract.md)

---

## Submission

### Deadline

**Minggu 11** (sesuai jadwal demo)

### Cara Submit

1. Push semua kode ke GitHub repository
2. Pastikan repository **public** atau invite dosen sebagai collaborator
3. Siapkan demo untuk presentasi
4. Kumpulkan link repository ke LMS/sistem yang ditentukan

### Format Nama Repository

```
blockchain-project3-[nama-kelompok]
```

Contoh: `blockchain-project3-team-alpha`
