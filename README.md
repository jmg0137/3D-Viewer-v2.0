# 3D-Viewer-v2
Trabajo de Fin de Grado de la Universidad de Burgos.

Se trata de un visor 3D para modelos óseos en formato <<.PLY>> dirigido para la docencia online del Grado en Historia y Patrimonio de la universidad de Burgos.

Se distinguen en la aplicación entre roles de usuario obtenidos directamente de la plataforma de UBUVirtual, teniendo cada uno de ellos distintas funcionalidades. Los roles pueden ser o <<Profesor>> o que no sea profesor (generalmente alumno), siendo estos roles los proporcionados por Moodle
Este proceso se realiza tras introducir nuestras credenciales en la página de login:

![Página de login](https://github.com/jmg0137/3D-Viewer-v2.0/blob/master/Documentaci%C3%B3n/LaTex/img/login-page.JPG)

Dependiendo si se tiene rol de <<Profesor>> o <<Alumno>> la aplicación se verá de distinta manera.

-Para un profesor la página de inicio se verá así:

![Página de inicio profesor](https://github.com/jmg0137/3D-Viewer-v2.0/blob/master/Documentaci%C3%B3n/LaTex/img/main-page-profesor.JPG)

-Mientras que un alumno lo verá así:

![Página de inicio alumno](https://github.com/jmg0137/3D-Viewer-v2.0/blob/master/Documentaci%C3%B3n/LaTex/img/main-page-alumno.JPG)

Tanto los alumnos como los profesores podrán visualizar modelos, pudiendo añadirlos anotaciones y medidas o importando y exportando datos de ese modelo:

![Visor de modelos](https://github.com/jmg0137/3D-Viewer-v2.0/blob/master/Documentaci%C3%B3n/LaTex/img/viewer-femur-annotation-greater-trocanter.jpg)

Sin embargo, los profesores podrán acceder a una herramienta que facilite la corrección y visualización de ejercicios, en la que cada modelo tendrá sus propios ejercicios:

![Ejercicios por modelo](https://github.com/jmg0137/3D-Viewer-v2.0/blob/master/Documentaci%C3%B3n/LaTex/img/rep-ejercicios-por-modelo.JPG)

Se distinguen entre los datos importados entre alumnos y profesores con el fin de facilitar la visualización por parte del profesor:

![Distinción entre datos importados por alumnos](https://github.com/jmg0137/3D-Viewer-v2.0/blob/master/Documentaci%C3%B3n/LaTex/img/dif-import-colors.JPG)

Nuestra aplicación permita la subida de modelos en formato <.PLY>>:

![Subida de modelos](https://github.com/jmg0137/3D-Viewer-v2.0/blob/master/Documentaci%C3%B3n/LaTex/img/subida-modelos.JPG)

Un objetivo principal de este proyecto es el dar seguridad a los modelos subidos a la aplicación debido a su importancia y unicidad, por lo que la apliación encriptará los modelos al subirlos y los desencriptará a la hora de mostrarlos.
A continuación, se muestra un modelo encriptado con su predecesor.

-Partiendo de un modelo como este:

![Modelo sin encriptar](https://github.com/jmg0137/3D-Viewer-v2.0/blob/master/Documentaci%C3%B3n/LaTex/img/skull-corrected-notencripted.JPG)

-Obtenemos un modelo de la siguiente manera:

![Modelo encriptado](https://github.com/jmg0137/3D-Viewer-v2.0/blob/master/Documentaci%C3%B3n/LaTex/img/skull-corrected-encripted.JPG)

(Cabe mencionar que, en la última mejora de la seguridad, debido a la encriptación del modelo, no se llega a reflejar en el visor ningún tipo de imagen.)
