const test = async () => {
  try {
    let token;
    let res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST", headers: {"Content-Type": "application/json"},
      body: JSON.stringify({name: "Tester", email: `test${Date.now()}@test.com`, password: "password123", role: "Admin"})
    });
    let data = await res.json();
    token = data.token;
    console.log("Registered:", data.success);

    // Create ticket
    res = await fetch("http://localhost:5000/api/tickets", {
      method: "POST", headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
      body: JSON.stringify({title: "Test Ticket", description: "This is a test ticket"})
    });
    data = await res.json();
    console.log("Create Ticket Status:", res.status);
    console.log("Create Ticket Data:", data);

    // Get tickets
    res = await fetch("http://localhost:5000/api/tickets", {
      method: "GET", headers: {"Authorization": `Bearer ${token}`}
    });
    data = await res.json();
    console.log("Get Tickets Status:", res.status);
    console.log("Get Tickets Success:", data.success);
    console.log("Get Tickets Count:", data.data?.length);
  } catch (e) {
    console.error("Test execution failed:", e);
  }
}
test();
