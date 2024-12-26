const db = require('../db.js');
const bcrypt = require('bcrypt');
const { sendResetPasswordEmail} = require('../services/mailer');
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
// use `prisma` in your application to read and write data in your DB

// const getUsers = async () => {
//     try {
//         const result = await db.query("SELECT id, email, nama_lengkap FROM users ORDER BY nama_lengkap ASC");
//         return result.rows;
//     } catch (error) {
//         console.error('Error fetching user list:', error);
//         throw error;
//     }
// };

// const findUserByEmail = async (email) => {
//     try {
//         const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
//         if (result.rows.length === 0) {
//             return null;
//         }
//         return result.rows[0];
//     } catch (error) {
//         console.error('Error finding user by email:', error);
//         throw error;
//     }
// };

// const findUserById = async (userId) => {
//     try {
//         const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
//         if (result.rows.length === 0) {
//             return null;
//         }
//         return result.rows[0];
//     } catch (error) {
//         console.error(`Error finding user with id ${userId}:`, error);
//         throw error;
//     }
// };

const createJurusan = async (data) => {
    try {
        const result = await db.query(
            'INSERT INTO jurusan (nama, sejarah_singkat, path_logo, logo) VALUES ($1, $2, $3, $4) RETURNING id',
            [data.nama, data.sejarah_singkat, data.logo_path,  data.logo]
        );

        return { id: result.id, nama : data.nama, body : data.sejarah_singkat, logo:'logo' };
    } catch (error) {
        console.error('Error saat menambahkan user: ', error);
        throw error;
    }
};

const updateJurusan = async (data, id) => {
    try {
      if (!data.logo) {
        delete data.logo
        delete data.path_logo
      }
  
      // Panggil service untuk update data
      await prisma.jurusan.update({
        where : {
            id: id
        }, data : data
      });
  
      return data
    } catch (error) {
      console.warn(error);
        throw error
    }
  };

  const createGaleri = async (data) => {
    try {
        return prisma.$transaction(async (prisma) => {
          for (const item of data.galeri) {
            item.jurusan_id = +data.jurusan_id
            item.nama_file = item.file
            item.path = data.path
            delete item.file
            await prisma.galeri_jurusan.create({data : item})
          }
        })
    } catch (error) {
      throw error;
    }
};

const updateStruktur = async (data) => {
    try {
        return prisma.$transaction(async (prisma) => {
          for (const item of data.struktur) {

            const where = {
              jurusan_id : item.jurusan_id,
              id : item.id,
            }

            const params_update = {
              order : +item.order,
              jabatan : item.jabatan,
              nama : item.nama,
              nama_foto :item.nama_foto,
              path_foto : item.path
            }

            await prisma.struktur_org_jurusan.update({where : where, data : params_update});
        }
      })
    } catch (error) {
      throw error;
    }
}

const createStruktur = async (data) => {
    try {
        return prisma.$transaction(async (prisma) => {
            for (const item of data.struktur) {
                item.jurusan_id = +data.jurusan_id
                item.nama_foto = item.file
                item.path_foto = data.path
                item.order = +item.order
                delete item.file
            await prisma.struktur_org_jurusan.create({data : item})
          }
        })
    } catch (error) {
      throw error;
    }
};

const updateGaleri = async (data) => {
    try {
        return prisma.$transaction(async (prisma) => {
          for (const item of data.galeri) {

            const where = {
              jurusan_id : item.jurusan_id,
              id : item.id,
            }

            const params_update = {
              judul : item.judul,
              deskripsi : item.deskripsi,
              path : item.path,
              nama_file :item.nama_file,
            }

            await prisma.galeri_jurusan.update({where : where, data : params_update});
        }
      })
    } catch (error) {
      throw error;
    }
}

const findOne = async (id) => {
  try {
    return await prisma.jurusan.findFirst({
      where : {id}, 
      include : {
        struktur_org_jurusan:true,
        galeri_jurusan: true
      }
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
    filters.nama = { contains: search }; // Filter berdasarkan "nama"
  }

  try {
    // Ambil data sesuai filter dan pagination
    const dataOut = await prisma.jurusan.findMany({
      where: filters,
      include: {
        struktur_org_jurusan: true,
        galeri_jurusan: true,
      },
      skip: page > 1 ? (page - 1) * perpage : 0,
      take: perpage,
    });

    // Hitung total data berdasarkan filter
    const totalData = await prisma.jurusan.count({
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
      return await prisma.jurusan.delete({
        where : {id:id},
        include : {
          struktur_org_jurusan : true,
          galeri_jurusan : true
        }
      });
    });
  } catch (error) {
    throw error;
  };
}


module.exports = {
    createJurusan,
    updateJurusan,
    createGaleri,
    createStruktur,
    updateStruktur,
    updateGaleri,
    findOne,
    findAll,
    remove
};
