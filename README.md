# 3D-Viewer-v2
Trabajo de Fin de Grado de la Universidad de Burgos.

Se trata de un visor 3D para modelos óseos en formato <<.PLY>> dirigido para la docencia online del Grado en Historia y Patrimonio de la universidad de Burgos.

Se distinguen en la aplicación entre roles de usuario obtenidos directamente de la plataforma de UBUVirtual, teniendo cada uno de ellos distintas funcionalidades. Los roles pueden ser o <<Profesor>> o que no sea profesor (generalmente alumno), siendo estos roles los proporcionados por Moodle
Este proceso se realiza tras introducir nuestras credenciales en la página de login:

![Página de login](https://github.com/jmg0137/3D-Viewer-v2.0/blob/master/Documentaci%C3%B3n/LaTex/img/login-page.JPG)

Dependiendo si se tiene rol de <<Profesor>> o <<Alumno>> la aplicación se verá de distinta manera.

-Para un profesor la página de inicio se verá así:



-Mientras que un alumno lo verá así:



Tanto los alumnos como los profesores podrán visualizar modelos, pudiendo añadirlos anotaciones y medidas o importando y exportando datos de ese modelo:



Sin embargo, los profesores podrán acceder a una herramienta que facilite la corrección y visualización de ejercicios, en la que cada modelo tendrá sus propios ejercicios:



Se distinguen entre los datos importados entre alumnos y profesores con el fin de facilitar la visualización por parte del profesor:



Nuestra aplicación permita la subida de modelos en formato <.PLY>>:



Un objetivo principal de este proyecto es el dar seguridad a los modelos subidos a la aplicación debido a su importancia y unicidad, por lo que la apliación encriptará los modelos al subirlos y los desencriptará a la hora de mostrarlos.
A continuación, se muestra un modelo encriptado con su predecesor.

-Partiendo de un modelo como este:



-Obtenemos un modelo de la siguiente manera:



(Cabe mencionar que, en la última mejora de la seguridad, debido a la encriptación del modelo, no se llega a reflejar en el visor ningún tipo de imagen.)
