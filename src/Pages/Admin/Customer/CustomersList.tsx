import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import { db } from "../../../service/firebase";

const CustomersList = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    const snapshot = await getDocs(collection(db, "customers"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading customers...</p>;
  }

  return (
    <div className="flex justify-center mt-10">
      <Card className="w-[90%] shadow-xl">
        <CardContent>
          <div className="flex justify-between items-center mb-5">
            <Typography variant="h5">Customers</Typography>
            <Button variant="contained" href="/customers">
              + Add Customer
            </Button>
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Units</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {customers.map((cust) => (
                <TableRow key={cust.id}>
                  <TableCell>{cust.name}</TableCell>
                  <TableCell>{cust.email}</TableCell>
                  <TableCell>{cust.phone}</TableCell>
                  <TableCell>{cust.address}</TableCell>
                  <TableCell>{cust.purchasedUnits.length}</TableCell>
                  <TableCell>{cust.status}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      href={`/customer/${cust.id}`}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomersList;
