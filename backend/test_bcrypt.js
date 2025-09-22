import bcrypt from "bcryptjs";

const password = "admin123456";

console.log("Testing bcrypt directly...");
console.log("Original password:", password);

// Test hashing and comparing
const salt = await bcrypt.genSalt(12);
console.log("Salt:", salt);

const hash = await bcrypt.hash(password, salt);
console.log("Hash:", hash);
console.log("Hash length:", hash.length);

const isValid = await bcrypt.compare(password, hash);
console.log("Comparison result:", isValid);

// Test with different approaches
const isValid2 = await bcrypt.compare("admin123456", hash);
console.log("Comparison with literal string:", isValid2);

const isValid3 = bcrypt.compareSync(password, hash);
console.log("Sync comparison:", isValid3);
