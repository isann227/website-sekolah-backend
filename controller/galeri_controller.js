const db = require('../db.js');
const bcrypt = require('bcrypt');
const { sendResetPasswordEmail} = require('../services/mailer');
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const create = async (data) => {
  try {
    return await prisma.galeri.create({
    data : data
    });
  } catch (error) {
      console.error('Error saat menambahkan data: ', error);
      throw error;
  }
};

const update = async (data, id) => {
    try {
      if (!data.nama_file) {
        delete data.nama_file
        delete data.path
      }

      // Panggil service untuk update data
      return await prisma.galeri.update({
        where : {
            id: id
        }, data : data
      });
  
    } catch (error) {
      console.warn(error);
        throw error
    }
  }

const findOne = async (id) => {
  try {
    return await prisma.galeri.findFirst({
      where : {id}, 
    }
    ); 
  } catch (error) {
    throw error;
  }
}

const findAll = async (search, page, perpage) => {
  const output = {
    list_data: [],
    search: search || null,
    per_page: perpage,
    page: page,
    last_page: page,
    total_data: 0,
  };

  const filters = {};
  if (search) {
    filters.judul = { contains: search }; // Filter berdasarkan "nama"
  }

  try {
    // Ambil data sesuai filter dan pagination
    const dataOut = await prisma.galeri.findMany({
      where: filters,
      skip: page > 1 ? (page - 1) * perpage : 0,
      take: perpage,
    });

    // Hitung total data berdasarkan filter
    const totalData = await prisma.galeri.count({
      where: filters,
    });

    // Perbarui output
    output.total_data = totalData;
    output.last_page = Math.ceil(totalData / perpage);
    output.list_data = dataOut;

    return output;
  } catch (error) {
    console.error(error);
    throw new Error('Terjadi kesalahan saat mengambil data.');
  }
};

const remove = async (id) => {
  try {
    return prisma.$transaction(async (prisma) => {
      return await prisma.galeri.delete({
        where : {id:id},
      });
    });
  } catch (error) {
    throw error;
  };
}


module.exports = {
    create,
    update,
    findOne,
    findAll,
    remove
};
