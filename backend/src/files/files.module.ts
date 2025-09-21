import { Module } from '@nestjs/common'
import { FilesController } from './files.controller.js'
import { FilesService } from './files.service.js'

@Module({ controllers: [FilesController], providers: [FilesService], exports: [FilesService] })
export class FilesModule {}

