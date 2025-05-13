import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private postsRepository: Repository<PostEntity>,
  ){}

  async create(post: CreatePostDto): Promise<PostEntity> {
    const newPost: PostEntity = this.postsRepository.create(post);

    return this.postsRepository.save(newPost);
  }

  async findAll(): Promise<PostEntity[]> {
    return this.postsRepository.find();
  }

  async findOne(id: number): Promise<PostEntity> {
    return this.findPostById(id);
  }

  async update(id: number, dto: UpdatePostDto): Promise<PostEntity> {
    const post = await this.findPostById(id);

    Object.assign(post, dto);

    return this.postsRepository.save(post);
  }

  async remove(id: number): Promise<void> {
    const post = await this.findPostById(id);
    await this.postsRepository.remove(post)
  }

  async like(id: number): Promise<PostEntity> {
    const post = await this.findPostById(id);
    post.likes += 1;
    return this.postsRepository.save(post);
  }

  async dislike(id: number): Promise<PostEntity> {
    const post = await this.findPostById(id);
    post.dislikes += 1;
    return this.postsRepository.save(post);
  }

  private async findPostById(id: number): Promise<PostEntity> {
    const post = await this.postsRepository.findOne({ where: { id }})
    
    if (!post) throw new NotFoundException(`Error! There is no post with id: ${id}`);

    return post;
  }
}
