---
title: Docker Fundamentals
description: An introduction to Docker's core concepts, including containers, images, registries, and how containers differ from virtual machines.
category: Developer Tools
tag:
  - Docker
head:
  - - meta
    - name: keywords
      content: Docker,containers,images,registries,engine,isolation,containers vs virtual machines,deployment
---

This article covers Docker's core concepts, runtime model, and common use cases. It does not cover installation. For installation, command practice, and running local services, see [Docker in Practice](./docker-in-action.md).

## Introduction to Containers

Docker is a widely used containerization platform. To understand Docker, first understand the problems containers solve.

### What Is a Container?

#### A Formal Definition

**In short, a container packages software into a standardized unit for development, delivery, and deployment.**

- **A container image is a lightweight, standalone executable package** containing everything software needs to run: code, runtime, system tools, libraries, and settings.
- **Containerized software can run consistently in any environment** for Linux- and Windows-based applications.
- **Containers isolate software** from differences in its environment, such as development and staging, helping reduce conflicts when teams run different software on the same infrastructure.

#### A Simple Analogy

In simple terms, a container is a place to put things, like a backpack for stationery, a closet for clothes, or a shoe rack for shoes. In software, a container holds an application such as a website or program, along with its runtime environment.

![Understanding containers](https://oss.javaguide.cn/github/javaguide/tools/docker/container.png)

### Physical Machines, Virtual Machines, and Containers

The comparison between virtual machines and containers is covered in more detail below. These images from the web provide a quick visual comparison of physical machines, virtual machines, and containers.

**Physical machine:**

![Physical machine](https://oss.javaguide.cn/github/javaguide/tools/docker/%E7%89%A9%E7%90%86%E6%9C%BA%E5%9B%BE%E8%A7%A3.jpeg)

**Virtual machine:**

![Virtual machine](https://oss.javaguide.cn/github/javaguide/tools/docker/%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%9B%BE%E8%A7%A3.jpeg)

**Container:**

![](https://oss.javaguide.cn/javaguide/image-20211110104003678.png)

These diagrams suggest that **containers virtualize the operating system, not the hardware, and share the host operating system's resources. A virtual machine virtualizes hardware and runs a complete operating system on it, so containers provide a somewhat lower level of isolation.**

### Containers vs. Virtual Machines

Containers are often compared with virtual machines. In my view, neither needs to replace the other; they can coexist.

In short, **containers and virtual machines both provide resource isolation and allocation, but they serve different purposes. Containers virtualize the operating system rather than hardware, so they are more portable and efficient.**

Traditional virtual machines emulate hardware, run a complete operating system on it, and then run applications. A container's application processes run directly on the host kernel. Containers have no separate kernel and do not virtualize hardware, which makes them lighter than traditional virtual machines.

![](https://oss.javaguide.cn/javaguide/2e2b95eebf60b6d03f6c1476f4d7c697.png)

**Containers and virtual machines:**

![](https://oss.javaguide.cn/javaguide/4ef8691d67eb1eb53217099d0a691eb5.png)

- A container is an application-layer abstraction that packages code and dependencies. Multiple containers can run on one machine, sharing the operating-system kernel while running as isolated processes in user space. Compared with virtual machines, **containers use less disk space** (images are often only tens of megabytes) and **start almost instantly**.

- A virtual machine (VM) is a hardware-layer abstraction that lets one physical server act like several. A hypervisor runs multiple VMs on one machine. Each VM includes a complete operating system, one or more applications, binaries, and libraries, so it **uses much more disk space** and **starts more slowly**.

Docker has many advantages, but virtual machines still have their place. **Virtual machines are better at completely isolating runtime environments.** Cloud providers, for example, often use them to isolate customers. **Docker is commonly used to isolate applications**, such as frontend, backend, and database services.

In my view, neither needs to replace the other; they can coexist.

![](https://oss.javaguide.cn/javaguide/056c87751b9dd7b56f4264240fe96d00.png)

## Introduction to Docker

### What Is Docker?

Docker can be understood in several ways:

- **Docker is a software containerization platform.**
- **Docker** is written in Go and uses Linux kernel features such as cgroups, namespaces, and UnionFS to isolate processes. It is an operating-system-level virtualization technology.
- Docker packages applications and their runtime dependencies into images, reducing inconsistencies between development, testing, and deployment environments.
- Users can create containers and run applications in them. Containers can also be versioned, copied, shared, and modified like code.

**The ideas behind Docker:**

- **Shipping containers:** Like shipping containers, Docker containers package applications with all their dependencies so they run consistently in different environments.
- **Standardization:** Standardize how containers are transported, stored, and accessed through APIs.
- **Isolation:** Each Docker container runs in its own isolated environment, separate from the host and other containers.

### Characteristics of Docker Containers

- **Lightweight:** Multiple containers on one machine share its operating-system kernel, start quickly, and use relatively few CPU and memory resources. Images are built in filesystem layers and can share common files, reducing disk usage and download times.
- **Standardized:** Docker containers follow open standards and can run on major Linux distributions, Microsoft Windows, and infrastructure ranging from VMs and bare-metal servers to cloud platforms.
- **Isolation:** Docker isolates applications from one another and from the underlying infrastructure. Problems in an application are generally contained within its container rather than affecting the whole machine.

### Why Use Docker?

- Docker images provide a consistent runtime environment, excluding the kernel, and help avoid “it works on my machine” problems.
- Containers can start in seconds or even milliseconds, saving time during development, testing, and deployment.
- Isolation prevents applications from interfering with one another on a shared server.
- Docker supports elasticity and rapid scaling during traffic spikes.
- Applications can be moved between platforms without worrying as much about environment differences.
- Custom images support continuous integration, continuous delivery, and deployment.

---

## Docker Core Concepts

Docker has three core concepts: images, containers, and repositories. Understanding them makes Docker's lifecycle easier to follow.

![](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-build-run.jpeg)

### Image: A Special Filesystem

**An operating system consists of a kernel and user space.** On Linux, after the kernel starts, it mounts a root filesystem that provides user space. A Docker image serves a similar role to a root filesystem.

**A Docker image is a special filesystem containing the programs, libraries, resources, and configuration needed to run a container. It can also include runtime settings such as anonymous volumes, environment variables, and users.** Images contain no dynamic data, and their contents do not change after they are built.

Docker uses **UnionFS** to implement **layered storage**. An image is made up of multiple filesystem layers.

**Image layers are built one at a time, with each layer based on the one before it. Once built, a layer does not change; subsequent changes are stored in later layers.** For example, deleting a file from an earlier layer does not actually remove it. The current layer marks it as deleted. The file is hidden when the container runs, but remains in the image. Keep each layer focused on the files it needs, and remove temporary files before the layer is built to avoid carrying unnecessary data into the image.

Layered storage also makes images easier to reuse and customize. You can use an existing image as a base, add layers, and build a new image with the content you need.

### Container: A Running Image

The relationship between an image and a container is similar to the relationship between a class and an instance in object-oriented programming. An image is a static definition; **a container is a running instance of an image. Containers can be created, started, stopped, removed, and paused.**

**A container is a process, but unlike a process running directly on the host, it runs in its own namespaces. Like images, containers also use layered storage.**

**A container's writable layer has the same lifecycle as the container. When the container is removed, that layer is removed too, and any data stored there is lost.**

Docker best practices recommend that **containers not store application data in their writable layer**. Keep that layer as stateless as possible. **Use a volume or bind mount for files that must persist.** These bypass the container's writable layer and store data on the host or network storage. Volumes have their own lifecycle and are not automatically removed with a container.

### Repository: A Place to Store Images

After building an image, you can run it on the current host. **To use it on other servers, you need a centralized service for storing and distributing images. A Docker Registry provides this service.**

A Docker Registry can contain multiple repositories. Each repository can contain multiple tags, and each tag identifies an image. **A repository is a place to store related images, much like a code repository stores related source code.**

Typically, **a repository contains images for different versions of the same software**, and **tags identify those versions**. Specify an image as `<repository>:<tag>`. If no tag is given, Docker uses `latest`. In production, avoid relying on `latest`; specify a version tag so you can roll back and troubleshoot reliably.

**Docker registries can be public or private.**

A **public Docker Registry** is available for users to manage images. Public images can generally be uploaded and downloaded for free, while some services charge for private image hosting.

The most widely used public registry is **Docker Hub**, Docker's default registry. It hosts many high-quality official images: [https://hub.docker.com/](https://hub.docker.com/ "https://hub.docker.com/"). Docker describes it as:

> A service for finding and sharing container images with your team.

For example, you can search Docker Hub for an image:

![Search for images on Docker Hub](https://oss.javaguide.cn/github/javaguide/tools/docker/Screen%20Shot%202019-11-04%20at%208.21.39%20PM.png)

Docker Hub search results include several details that can help you choose an image:

- **OFFICIAL Image:** Provided and maintained by Docker, and generally more reliable and secure.
- **Stars:** Similar to stars on GitHub.
- **Downloads:** The number of times an image has been pulled, which gives a rough indication of how often it is used.

You can also search Docker Hub images from the command line with `docker search`:

```bash
➜  ~ docker search mysql
NAME                              DESCRIPTION                                     STARS               OFFICIAL            AUTOMATED
mysql                             MySQL is a widely used, open-source relation…   8763                [OK]
mariadb                           MariaDB is a community-developed fork of MyS…   3073                [OK]
mysql/mysql-server                Optimized MySQL Server Docker images. Create…   650                                     [OK]
```

Access to **Docker Hub** may be slow in some regions. Enterprise projects often use an internal registry or a cloud provider's registry to cache and distribute images.

You can also **run a private Docker Registry**. Docker provides a Registry image that can be used as a private registry. The open-source Registry image implements the Docker Registry API and supports Docker commands, but does not include a graphical interface or advanced features such as image maintenance, user management, and access control.

### How Images, Containers, Repositories, and Registries Relate

The diagram below shows how images, containers, repositories, and registries or hubs relate:

![Docker architecture](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-regitstry.png)

- A Dockerfile is a text file containing instructions and parameters that define how to build an image. When you run `docker build` with a Dockerfile, Docker reads its instructions, builds the image, and saves it locally.
- `docker pull` downloads an image from a specified registry or hub. It uses Docker Hub by default.
- `docker run` creates and starts a container from a local image. If the image is not available locally, Docker tries to pull it from a registry or hub first.
- `docker push` uploads a local image to a specified registry or hub.

The hands-on guide covers these and other Docker commands in more detail.

### Build, Ship, and Run

Now that we have covered the basic Docker concepts, let's look at the phrase “Build, Ship, and Run.”

The Docker website describes Docker as **“Build, Ship, and Run Any App, Anywhere.”** What does that mean?

![](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-build-ship-run.jpg)

- **Build:** Create an image containing the application's files and runtime environment, much like packing goods into a shipping container.
- **Ship:** Transfer the image between a host and a registry, which acts like a shipping hub.
- **Run:** Start a container from the image. The container is where the application runs.

In a typical Docker workflow, you pull an image from a registry and start it as a container with a command. The name Docker also refers to a dock worker who handles shipping containers.

## Common Docker Commands

### Basic Commands

```bash
docker version # Show the Docker version
docker images # List downloaded images; equivalent to docker image ls
docker container ls # List containers
docker ps # List running containers
docker image prune # Remove unused images; -a/--all removes all images not used by containers
```

### Pull an Image

`docker pull` uses Docker Hub by default. If you do not specify a registry address, Docker pulls the image from Docker Hub.

```bash
docker search mysql # Search for MySQL images
docker pull mysql:8.4 # Pull the MySQL image
docker image ls # List downloaded images
```

### Build an Image

When you run `docker build` with a Dockerfile, Docker reads its instructions, builds a new image, and saves it locally.

```bash
# image-name is the image name; 1.0.0 is its version or tag
docker build -t image-name:1.0.0 .
```

The Dockerfile does not have to be named `Dockerfile` or placed at the root of the build context. Use `-f` or `--file` to specify a Dockerfile at any path. By convention, however, it is usually named `Dockerfile` and placed in the build context directory.

### Remove an Image

For example, suppose you want to remove a downloaded MySQL image.

Before removing an image with `docker rmi [image]` (equivalent to `docker image rm [image]`), make sure no container is using it. You can remove an image by its tag or ID. Use `docker ps` to check whether a container is using it.

```shell
➜  ~ docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                               NAMES
c4cd691d9f80        mysql:5.7           "docker-entrypoint.s…"   7 weeks ago         Up 12 days          0.0.0.0:3306->3306/tcp, 33060/tcp   mysql
```

Here, the container with ID `c4cd691d9f80` is using `mysql:5.7`. Stop it first with `docker stop c4cd691d9f80` or `docker stop mysql`.

Then find the MySQL image ID:

```shell
➜  ~ docker images
REPOSITORY              TAG                 IMAGE ID            CREATED             SIZE
mysql                   5.7                 f6509bac4980        3 months ago        373MB
```

Remove the image by its `IMAGE ID` or `REPOSITORY:TAG`:

```shell
docker rmi f6509bac4980 # or docker rmi mysql:5.7
```

### Push an Image

Use `docker push` to upload a local Docker image to a specified registry or hub.

```bash
# Push the image to the private Harbor registry
# harbor.example.com is the registry address; ubuntu is the image name; 18.04 is the tag
docker push harbor.example.com/ubuntu:18.04
```

Before pushing, make sure the image exists locally and that you are logged in to the target registry.

## Docker Data Management

There are two main ways to manage data in containers:

1. Volumes
2. Bind mounts

![Docker data management](https://oss.javaguide.cn/github/javaguide/tools/docker/docker-data-management.png)

Volumes are storage areas managed by Docker. They have the following characteristics:

- They can be shared and reused across containers.
- Their data is not automatically removed when a container is removed, so it persists.
- Changes to a volume take effect immediately.
- Updating a volume does not change the image.

```bash
# Create a volume
docker volume create my-vol
# List all volumes
docker volume ls
# Show details for a volume
docker volume inspect my-vol
# Remove a volume
docker volume rm my-vol
```

Use the `--mount` flag with `docker run` to mount one or more volumes in a container.

You can also use `--mount` to mount a host file or directory in a container, giving the container direct access to it. Host directory mounts are read-write by default; add `readonly` to make one read-only.

## Docker Compose

### What Is Docker Compose?

Docker Compose is Docker's tool for defining and running multi-container applications. A YAML file describes the application's services, networks, ports, and volumes. You can then start or stop the whole set of services with one command.

Docker Compose is an open-source project: <https://github.com/docker/compose>.

Its core features include:

- **Multi-container management:** Define and manage multiple containers in one YAML file.
- **Service orchestration:** Configure networking and dependencies between containers.
- **Start and stop as a group:** Use commands such as `docker compose up` and `docker compose down` to start and stop the application.

Docker Compose simplifies the development, testing, and deployment of multi-container applications, while reducing deployment and management effort.

### Compose File Structure

The Compose file defines and configures a multi-container Docker application. It is usually named `compose.yaml` or `docker-compose.yml` and uses YAML (YAML Ain't Markup Language) format.

The main elements are:

- **Services (`services`):** Define the application's containers. Each service can have its own image, environment, and dependencies.
  - **Image (`image`):** The image used to start the container, specified by repository, tag, or image ID.
  - **Command (`command`):** Optional. Overrides the default command, for example to start the application or run an initialization script.
  - **Ports (`ports`):** Optional. Map container ports to host ports.
  - **Dependencies (`depends_on`):** Set service startup dependencies. For example, a backend can depend on a database.
  - **Environment (`environment`):** Optional. Set environment variables required by the service.
  - **Restart (`restart`):** Optional. Set the policy for restarting a container after it exits.
  - **Volumes (`volumes`):** Optional. Define volumes for persistent or shared data.
  - **Build (`build`):** Specify the Dockerfile build context or a detailed build configuration.
- **Networks (`networks`):** Define network connections between containers.
- **Volumes (`volumes`):** Define volumes for persistent or shared data, such as database files, configuration, and logs.

```yaml
services:
  service-name-1:
    image: nginx:stable
    command: ["nginx", "-g", "daemon off;"]
    environment:
      TZ: Asia/Shanghai
    volumes:
      - web_data:/usr/share/nginx/html
    networks:
      - app_net
    ports:
      - "8080:80"
    restart: unless-stopped
    depends_on:
      - service-name-2
  service-name-2:
    image: redis:7
    networks:
      - app_net

volumes:
  web_data:

networks:
  app_net:
```

### Common Docker Compose Commands

#### Start Services

`docker compose up` creates and starts the services defined in the Compose file and connects them to a Compose network. If no custom network is declared, Compose creates a default one.

```bash
# Find compose.yaml or docker-compose.yml in the current directory and start its services
docker compose up
# Start in the background
docker compose up -d
# Recreate all containers, even if they already exist
docker compose up --force-recreate
# Rebuild images
docker compose up --build
# Start specific services instead of all services
# Separate multiple service names with spaces.
docker compose up service-name
```

If the Compose file has a different name, specify it with `-f`.

```bash
docker compose -f compose.prod.yaml up
```

#### Stop Services

`docker compose down` stops and removes the containers and networks created by `docker compose up`.

```bash
# Find the Compose file in the current directory
# Remove the containers and networks defined in it
docker compose down
# Stop containers without removing them
docker compose stop
# Stop a specific service
docker compose stop service-name
```

As above, use `-f` to specify a Compose file with a different name.

```bash
docker compose -f compose.prod.yaml down
```

#### Inspect Services

Use `docker compose ps` to view the status of containers started by `docker compose up`.

```bash
# Show the status of all containers
docker compose ps
# Show service names only
docker compose ps --services
# Show containers for a specific service
docker compose ps service-name
```

#### Other Commands

| Command                  | Description                    |
| ------------------------ | ------------------------------ |
| `docker compose version` | Show the version               |
| `docker compose images`  | List images used by containers |
| `docker compose kill`    | Force-stop service containers  |
| `docker compose exec`    | Run a command in a container   |
| `docker compose logs`    | Show logs                      |
| `docker compose pause`   | Pause services                 |
| `docker compose unpause` | Resume services                |
| `docker compose push`    | Push service images            |
| `docker compose start`   | Start stopped services         |
| `docker compose stop`    | Stop running services          |
| `docker compose rm`      | Remove stopped containers      |
| `docker compose top`     | Show processes                 |

## How Docker Works

Docker is based on lightweight virtualization. What is virtualization?

In simple terms, virtualization can be defined as follows:

> Virtualization is a resource-management technique that abstracts and transforms physical computer resources—such as [CPU](https://en.wikipedia.org/wiki/Computer_science), [memory](https://en.wikipedia.org/wiki/Memory), [disk space](https://en.wikipedia.org/wiki/Disk_storage), and [network adapters](https://en.wikipedia.org/wiki/Network_interface_controller)—so they can be divided and combined into one or more computing environments. This breaks the constraints of physical hardware and lets users allocate resources more flexibly. Virtualized resources commonly include computing capacity and data storage.

Docker was originally based on LXC (Linux Containers), a container virtualization technology.

> LXC (Linux Containers) is an operating-system-level virtualization technology and a userspace interface to Linux kernel container features. It packages an application and its required libraries into a container. Shared APIs and namespaces allocate hardware resources to each container and create an isolated environment in which Linux users can manage system or application containers.

LXC relies mainly on Linux kernel cgroups and namespaces to provide software with an isolated runtime environment.

**Cgroups and namespaces:**

- **Namespaces isolate kernel resources.** Processes in one namespace see only the resources assigned to it, so they are unaware of processes in other namespaces. Linux namespaces isolate global system resources so that processes in different namespaces have separate views; changes in one namespace do not affect processes in another.

  (Based on [this introduction to namespaces](https://www.cnblogs.com/sparkdev/p/9365405.html).)

- **Cgroups (control groups) are a Linux kernel mechanism for limiting, tracking, and isolating the physical resources used by process groups**, such as CPU, memory, and I/O.

  (Based on [this introduction to cgroups](https://www.ibm.com/developerworks/cn/linux/1506_cgroup/index.html).)

**Cgroups and namespaces serve different purposes:**

Both group processes, but they serve different purposes. Namespaces isolate resources between process groups; cgroups monitor and limit the resources used by a group.

## Summary

This article covered common Docker concepts and commands. For a practical guide, see [Docker in Practice](https://javaguide.cn/tools/docker/docker-in-action.html).

Also see the high-quality open-source book [Docker — From Beginner to Practitioner](https://yeasy.gitbook.io/docker_practice/introduction/why), which can be updated continuously because its content is open source.

![Docker — From Beginner to Practitioner homepage](../../roadmap/images/shared/docker-getting-started-practice-website-homepage.png)

## References

- [Docker Compose: A Complete Guide from the Basics to Practical Use](https://juejin.cn/post/7306756690727747610)
- [Linux Namespaces and Cgroups](https://segmentfault.com/a/1190000009732550)
- [LXC vs Docker: Why Docker is Better](https://www.upguard.com/articles/docker-vs-lxc "LXC vs Docker: Why Docker is Better")
- [Cgroups: Introduction, Examples, and How They Work](https://www.ibm.com/developerworks/cn/linux/1506_cgroup/index.html)

<!-- @include: @article-footer.snippet.md -->
