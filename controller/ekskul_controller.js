const db = require('../db.js');
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const createEkskul = async (data) => {
    try {
        const result = await db.query(
            'INSERT INTO ekskul (nama, sejarah_singkat, path_logo, logo) VALUES ($1, $2, $3, $4) RETURNING id',
            [data.nama, data.sejarah_singkat, data.logo_path,  data.logo]
        );

        return { id: result.id, nama : data.nama, body : data.sejarah_singkat, logo:'logo' };
    } catch (error) {
        console.error('Error saat menambahkan user: ', error);
        throw error;
    }
};

const updateEkskul = async (data, id) => {
    try {
      if (!data.logo) {
        delete data.logo
        delete data.path_logo
      }
  
      // Panggil service untuk update data
      await prisma.ekskul.update({
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
              item.ekskul_id = +data.ekskul_id
              item.nama_file = item.file
              item.path = data.path
              delete item.file
              await prisma.galeri_ekskul.create({data : item})
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
                ekskul_id : item.ekskul_id,
                id : item.id,
              }
  
              const params_update = {
                order : +item.order,
                jabatan : item.jabatan,
                nama_siswa : item.nama_siswa,
                jurusan : item.jurusan,
                kelas : item.kelas,
                nama_foto :item.nama_foto,
                path_foto : item.path
              }
  
              await prisma.struktur_org_ekskul.update({where : where, data : params_update});
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
                  item.ekskul_id = +data.ekskul_id
                  item.nama_foto = item.file
                  item.path_foto = data.path
                  item.order = +item.order
                  delete item.file
              await prisma.struktur_org_ekskul.create({data : item})
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
               ekskul_id : item.ekskul_id,
               id : item.id,
             }
 
             const params_update = {
               judul : item.judul,
               deskripsi : item.deskripsi,
               path : item.path,
               nama_file :item.nama_file,
             }
 
             await prisma.galeri_ekskul.update({where : where, data : params_update});
         }
       })
     } catch (error) {
       throw error;
     }
 }
 
 const findOne = async (id) => {
   try {
     return await prisma.ekskul.findFirst({
       where : {id}, 
       include : {
         struktur_org_ekskul:true,
         galeri_ekskul: true
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
     filters.nama_siswa = { contains: search }; // Filter berdasarkan "nama"
   }
 
   try {
     // Ambil data sesuai filter dan pagination
     const dataOut = await prisma.ekskul.findMany({
       where: filters,
       include: {
         struktur_org_ekskul: true,
         galeri_ekskul: true,
       },
       skip: page > 1 ? (page - 1) * perpage : 0,
       take: perpage,
     });
 
     // Hitung total data berdasarkan filter
     const totalData = await prisma.ekskul.count({
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
       return await prisma.ekskul.delete({
         where : {id:id},
         include : {
           struktur_org_ekskul : true,
           galeri_ekskul : true
         }
       });
     });
   } catch (error) {
     throw error;
   };
 }



module.exports = {
    createEkskul,
    updateEkskul,
    createGaleri,
    updateStruktur,
    createStruktur,
    updateGaleri,
    findOne,
    findAll,
    remove

};