const db = require('../db.js');
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const updateVisimisi = async (data) => {
  try {
    const exist_data = await prisma.visimisi.findFirst();
    data.updated_at = new Date()
    if (exist_data) {
      return await prisma.visimisi.update({
        where: {
          id: exist_data.id ?? null
        }, 
        data : data,
      });
    }else{
      return await prisma.visimisi.create({
        data : data,
      });
    }
  } catch (error) {
    console.warn(error);
    throw error
  }
};

const findOne = async () => {
  try {
    return await prisma.visimisi.findFirst();
  } catch (error) {
    console.warn(error);
    throw error
  }
};



module.exports = {
  updateVisimisi,
  findOne,
};