// src/pages/DashboardPage.js
import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { collection, addDoc, query, onSnapshot, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function DashboardPage() {
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const userId = auth.currentUser?.uid;

  // Firestore listener
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "transactions"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const userData = allData.filter(tx => tx.userId === userId);
      setTransactions(userData);
    });

    return () => unsub();
  }, [userId]);

  // Add transaction
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!amount) return;

    await addDoc(collection(db, "transactions"), {
      userId, // associate with current user
      type,
      category,
      amount: parseFloat(amount),
      note,
      createdAt: new Date()
    });

    setAmount("");
    setNote("");
  };

  // Delete transaction
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "transactions", id));
  };

  // Inline edit
  const handleEdit = async (id, field, value) => {
    const docRef = doc(db, "transactions", id);
    await docRef.update({
      [field]: field === "amount" ? parseFloat(value) : value
    });
  };

  // CSV download
  const handleDownloadCSV = () => {
    const header = ["Date", "Type", "Category", "Amount", "Note"];
    const rows = transactions.map(tx => [
      tx.createdAt.toDate().toLocaleDateString(),
      tx.type,
      tx.category,
      tx.amount,
      tx.note
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Totals
  const totalIncome = transactions.filter(tx => tx.type === "income").reduce((a,b)=>a+b.amount,0);
  const totalExpense = transactions.filter(tx => tx.type === "expense").reduce((a,b)=>a+b.amount,0);
  const balance = totalIncome - totalExpense;

  // Pie chart (expenses only)
  const expenseCategories = [...new Set(transactions.filter(tx => tx.type === "expense").map(tx => tx.category))];
  const pieColors = [
    "#FF6384","#36A2EB","#FF9F40","#4BC0C0","#9966FF","#FFCD56","#00C49F","#FF6B6B"
  ];

  const pieData = {
    labels: expenseCategories,
    datasets: [{
      label: "Expenses by Category",
      data: expenseCategories.map(cat => transactions
        .filter(tx => tx.type === "expense" && tx.category === cat)
        .reduce((a,b) => a + b.amount, 0)
      ),
      backgroundColor: pieColors.slice(0, expenseCategories.length)
    }]
  };

  // Bar chart (monthly)
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const barData = {
    labels: months,
    datasets: [
      {
        label: "Income",
        data: months.map((m,i) => transactions.filter(tx => tx.type === "income" && tx.createdAt.toDate().getMonth()===i).reduce((a,b)=>a+b.amount,0)),
        backgroundColor: "#36A2EB"
      },
      {
        label: "Expense",
        data: months.map((m,i) => transactions.filter(tx => tx.type === "expense" && tx.createdAt.toDate().getMonth()===i).reduce((a,b)=>a+b.amount,0)),
        backgroundColor: "#FF9F40"
      }
    ]
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>

      {/* Info Boxes */}
      <div className="info-boxes">
        <div className="info-box"><h4>Total Income</h4><p>₹{totalIncome}</p></div>
        <div className="info-box"><h4>Total Expense</h4><p>₹{totalExpense}</p></div>
        <div className="info-box"><h4>Balance</h4><p>₹{balance}</p></div>
      </div>

      {/* Add Transaction */}
      <h3>Add Transaction</h3>
      <form onSubmit={handleAddTransaction}>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input type="text" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} required />
        <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required />
        <input type="text" placeholder="Note" value={note} onChange={e => setNote(e.target.value)} />
        <button type="submit">Add</button>
      </form>

      {/* Transactions Table */}
      <h3>Transactions</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Note</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id}>
              <td>{tx.createdAt.toDate().toLocaleDateString()}</td>
              <td>{tx.type}</td>
              <td contentEditable suppressContentEditableWarning onBlur={e=>handleEdit(tx.id,"category",e.target.innerText)}>{tx.category}</td>
              <td contentEditable suppressContentEditableWarning onBlur={e=>handleEdit(tx.id,"amount",e.target.innerText)}>{tx.amount}</td>
              <td contentEditable suppressContentEditableWarning onBlur={e=>handleEdit(tx.id,"note",e.target.innerText)}>{tx.note}</td>
              <td><button onClick={()=>handleDelete(tx.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* CSV Download */}
      <button onClick={handleDownloadCSV} style={{ marginTop: "10px", padding: "10px 20px", borderRadius:"8px", cursor:"pointer" }}>
        Download CSV
      </button>

      {/* Charts */}
      <div className="charts-row">
        <div className="chart-container"><h3>Expense by Category</h3><Pie data={pieData} options={{ responsive:true, maintainAspectRatio:false }}/></div>
        <div className="chart-container"><h3>Monthly Income vs Expense</h3><Bar data={barData} options={{ responsive:true, maintainAspectRatio:false }}/></div>
      </div>
    </div>
  );
}
