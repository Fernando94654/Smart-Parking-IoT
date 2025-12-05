const { Pool } = require('pg')
const constants = require('../constants')
const crypto = require('crypto');

const HOST = constants.dbHost;
const PORT = constants.dbPort;
const USR = constants.dbUser;
const PASS = constants.dbPass;
const DB = constants.dbName;

const pool = new Pool({
  host: HOST,
  port: PORT,
  user: USR,
  password: PASS,
  database: DB,
  max: 10,
  ssl: { rejectUnauthorized: false }
});

class QueryResult{
  constructor(status, rows, gen_id, changes, err){
      this.status = status;
      this.rows = rows;
      this.gen_id = gen_id;
      this.changes = changes;
      this.err = err;
  }

  getStatus = () => { return this.status; }
  getRows = () => { return this.rows; }
  getGenId = () => { return this.gen_id; }
  getChanges = () => { return this.changes; }
  getErr = () => { return this.err; }
}

async function getData(query){
  try{
    const res = await pool.query(query);
    return new QueryResult(true, res.rows, 0, res.rowCount, '');
  }catch(error){
    console.log(error);
    return new QueryResult(false, null, 0, 0, error);
  }
}

async function getDataWithParams(query, params){
  try{
      const res = await pool.query(query, params);
      return new QueryResult(true, res.rows, 0, res.rowCount, '');
  }catch(error){
    console.log(error);
    return new QueryResult(false, null, 0, 0, error);
  }
}

async function insertData(query, params) {
  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    const res = await client.query(query, params);
    await client.query("COMMIT");

    let genId = null;
    if (res.rows && res.rows[0] && res.rows[0].id) {
      genId = res.rows[0].id;
    } else {
      genId = crypto.randomUUID();
    }

    return new QueryResult(true, res.rows, genId, res.rowCount, "");
  } catch (error) {
    console.log(error);
    if (client)
      try { await client.query("ROLLBACK"); } catch (e) { console.error("Rollback failed", e); }
    return new QueryResult(false, null, null, 0, error);
  } finally {
    if (client) client.release();
  }
}

async function bulkInsertData(query, elements){
  let client;
  try{
      client = await pool.connect();
      await client.query('BEGIN');
      const res = await client.query(query, elements);
      await client.query('COMMIT');
      return new QueryResult(true, res.rows, 0, res.rowCount, '');
  } catch(error){
    console.log(error);
    if(client)  
      try { await client.query('ROLLBACK'); } catch (e) { console.error("Rollback failed:", e); }
    return new QueryResult(false, null, 0, 0, error); 
  } finally {
    if (client) client.release();
  }
}

async function updateData(query, params){
  let client;
  try{
      client = await pool.connect();
      await client.query('BEGIN');
      const res = await client.query(query, params);
      await client.query('COMMIT');
      return new QueryResult(true, res.rows, 0, res.rowCount, '');
  }catch(error){
    console.log(error);
    if(client) 
      try { await client.query('ROLLBACK'); } catch(e) { console.error('Rollback failed', e); }
    return new QueryResult(false, null, 0, 0, error); 
  } finally{
    if(client) client.release();
  }
}

async function callProcedure(query, params) {
  let client;
  try {
    client = await pool.connect();
    const res = await client.query(query, params);
    return new QueryResult(true, res.rows, 0, res.rowCount, '');
  } catch (error) {
    console.error(error);
    return new QueryResult(false, null, 0, 0, error);
  } finally {
    if (client) client.release();
  }
}

async function updateParkingSlotAvailable(id, available){
  try{
    const val = available ? 1 : 0;
    const query = `UPDATE "ParkingSlot" SET available = $1 WHERE id = $2`;
    const result = await updateData(query, [val, id]);
    return result;
  } catch(error){
    console.error(error);
    return new QueryResult(false, null, 0, 0, error);
  }
}

async function insertSensor(type, reading){
  try{
    const genId = crypto.randomUUID();
    const query = `INSERT INTO "Sensor" (id, type, reading) VALUES ($1, $2, $3) RETURNING id`;
    const result = await insertData(query, [genId, type, reading]);
    return result;
  } catch(error){
    console.error(error);
    return new QueryResult(false, null, 0, 0, error);
  }
}

module.exports = { QueryResult, getData, getDataWithParams, insertData, bulkInsertData, updateData, callProcedure, insertSensor, updateParkingSlotAvailable }