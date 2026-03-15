const mongoose = require("mongoose");
const { getDashboardMetrics } = require("./backend/controllers/analyticsController_enhanced.js");

// Mock req, res, next
const req = {};
const res = {
  json: function(payload) {
    console.log("--- DASHBOARD API RESPONSE ---");
    console.log(JSON.stringify(payload, null, 2));
    process.exit(0);
  }
};
const next = function(err) {
  console.error("--- ERROR ---", err);
  process.exit(1);
};

async function test() {
  await mongoose.connect("mongodb://localhost:27017/saas-crm", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to local DB. Running dashboard metrics...");
  
  await getDashboardMetrics(req, res, next);
}

test();
