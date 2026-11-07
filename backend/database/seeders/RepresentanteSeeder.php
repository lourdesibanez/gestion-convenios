<?php

namespace Database\Seeders;

class RepresentanteSeeder extends SeederIdempotente
{
    public function run(): void
    {
        $alta = '2026-11-01 03:20:58';

        $filas = [
            [1, 'Marcelo', 'Quiroga', '20456781', 'mquiroga@unlpam-demo.example.com', '+54 2302 410001'],
            [2, 'Silvia', 'Beltrán', '22345112', 'sbeltran@unlpam-demo.example.com', '+54 2302 410002'],
            [3, 'Héctor', 'Domínguez', '18765432', 'hdominguez@agro-demo.example.com', '+54 2302 410003'],
            [4, 'Mariana', 'Lescano', '25678903', 'mlescano@ing-demo.example.com', '+54 2302 410004'],
            [5, 'Ricardo', 'Altamirano', '17234567', 'raltamirano@acme-sa.example.com', '+54 2302 430005'],
            [6, 'Patricia', 'Funes', '21987654', 'pfunes@municipio-ejemplo.example.com', '+54 2302 430006'],
            [7, 'Gustavo', 'Echeverría', '16543219', 'gecheverria@fundaciondemo.example.org', '+54 2302 430007'],
            [8, 'Claudia', 'Mansilla', '24123789', 'cmansilla@colegioing-ficticio.example.org', '+54 2302 430008'],
            [9, 'Néstor', 'Videla', '19876540', 'nvidela@coopagricola-demo.example.com', '+54 2302 430009'],
            [10, 'Lucía', 'Fernández', '27456123', 'lfernandez@camaracom-ficticia.example.org', '+54 2302 430010'],
            [11, 'Tomás', 'Arriaga', '23890145', 'tarriaga@itmuestra.example.edu', '+54 2302 430011'],
            [12, 'Camila', 'Rojas', '42123456', 'camila.rojas@alumnos-demo.example.com', '+54 2302 15501012'],
            [13, 'Joaquín', 'Medina', '41987654', 'joaquin.medina@alumnos-demo.example.com', '+54 2302 15501013'],
            [14, 'Agustina', 'Paz', '42456789', 'agustina.paz@alumnos-demo.example.com', '+54 2302 15501014'],
            [15, 'Facundo', 'Sosa', '41765432', 'facundo.sosa@alumnos-demo.example.com', '+54 2302 15501015'],
            [16, 'Valentina', 'Ibarra', '43012345', 'valentina.ibarra@alumnos-demo.example.com', '+54 2302 15501016'],
            [17, 'Lautaro', 'Giménez', '42678901', 'lautaro.gimenez@alumnos-demo.example.com', '+54 2302 15501017'],
            [18, 'Daniela', 'Ortiz', '26345678', 'dortiz@unlpam-demo.example.com', '+54 2302 410018'],
            [19, 'Esteban', 'Roldán', '28123456', 'eroldan@acme-sa.example.com', '+54 2302 430019'],
            [20, 'Silvana', 'Cardozo', '29456780', 'scardozo@fundaciondemo.example.org', '+54 2302 430020'],
            [21, 'Oscar', 'Bermúdez', '20987123', 'obermudez@colegioing-ficticio.example.org', '+54 2302 430021'],
            [22, 'Marta', 'Cabrera', '24567812', 'mcabrera@coopagricola-demo.example.com', '+54 2302 430022'],
        ];

        $this->guardar(
            'representante',
            ['id'],
            ['id', 'nombre', 'apellido', 'tipo_documento', 'numero_documento', 'correo_electronico', 'telefono', 'created_at', 'created_by'],
            array_map(fn ($r) => [$r[0], $r[1], $r[2], 'DNI', $r[3], $r[4], $r[5], $alta, 1], $filas),
        );
    }
}
